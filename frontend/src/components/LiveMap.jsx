import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getSocket } from '../services/socket';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center smoothly
function MapUpdater({ center, zoom }) {
  const map = useMap();
  const prevCenterRef = useRef(center);
  
  useEffect(() => {
    if (center && (prevCenterRef.current[0] !== center[0] || prevCenterRef.current[1] !== center[1])) {
      map.setView(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1.0
      });
      prevCenterRef.current = center;
    }
  }, [center, zoom, map]);
  
  return null;
}

const LiveMap = ({ busId = null, showAllBuses = false }) => {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState({});
  const markerRefs = useRef({});

  // Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        if (showAllBuses) {
          const response = await api.get('/bus');
          // Only show buses with tracking enabled
          const trackedBuses = (response.data.buses || []).filter(bus => bus.tracking_enabled);
          setBuses(trackedBuses);
        } else if (busId) {
          const response = await api.get(`/bus/${busId}`);
          // Only show if tracking is enabled
          if (response.data.bus?.tracking_enabled) {
            setBuses([response.data.bus]);
          } else {
            setBuses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
      }
    };

    fetchBuses();
  }, [busId, showAllBuses]);

  // Socket and location updates
  useEffect(() => {
    const socket = getSocket();

    // Connection status handlers
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Join bus rooms for real-time updates
    if (busId) {
      socket.emit('join-bus-room', busId);
    } else if (showAllBuses) {
      buses.filter(bus => bus.tracking_enabled).forEach((bus) => {
        socket.emit('join-bus-room', bus.id);
      });
    }

    // Listen for location updates
    const handleLocationUpdate = (data) => {
      const newLocation = {
        lat: data.latitude,
        lng: data.longitude,
        speed: data.speed,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setLocations((prev) => ({
        ...prev,
        [data.busId]: newLocation,
      }));

      setLastUpdate((prev) => ({
        ...prev,
        [data.busId]: Date.now(),
      }));

      // Update center if tracking single bus (auto-follow)
      if (busId && data.busId === busId) {
        setCenter([data.latitude, data.longitude]);
      }
      
      // Also update center for any bus if it's the only one being tracked
      if (buses.length === 1 && data.busId === buses[0].id) {
        setCenter([data.latitude, data.longitude]);
      }

      // Smoothly animate marker if it exists
      if (markerRefs.current[data.busId]) {
        const marker = markerRefs.current[data.busId];
        marker.setLatLng([data.latitude, data.longitude], {
          animate: true,
          duration: 0.5
        });
      }
    };

    socket.on('location-update', handleLocationUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      if (busId) {
        socket.emit('leave-bus-room', busId);
      } else if (showAllBuses) {
        buses.forEach((bus) => {
          socket.emit('leave-bus-room', bus.id);
        });
      }
      socket.off('location-update', handleLocationUpdate);
    };
  }, [busId, showAllBuses, buses]);

  // Fetch initial locations and set up periodic refresh as fallback
  useEffect(() => {
    const fetchLocations = async () => {
      const busIds = busId ? [busId] : buses.map((b) => b.id);
      
      if (busIds.length === 0) return;
      
      // Fetch all locations in parallel instead of sequentially
      const locationPromises = busIds.map(async (id) => {
        try {
          const response = await api.get(`/gps/${id}`);
          if (response.data.location) {
            const location = {
              lat: response.data.location.latitude,
              lng: response.data.location.longitude,
              speed: response.data.location.speed,
              timestamp: response.data.location.created_at,
            };
            
            // Update center if this is the first location and we're tracking a single bus
            if (busId && id === busId && !locations[id]) {
              setCenter([location.lat, location.lng]);
            }
            
            return {
              id,
              location,
            };
          }
        } catch (error) {
          console.error(`Error fetching location for bus ${id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(locationPromises);
      
      // Update all locations at once
      setLocations((prev) => {
        const newLocations = { ...prev };
        results.forEach((result) => {
          if (result && result.location) {
            newLocations[result.id] = result.location;
            setLastUpdate((prev) => ({
              ...prev,
              [result.id]: Date.now(),
            }));
          }
        });
        return newLocations;
      });
    };

    fetchLocations();
    
    // Set up periodic refresh every 5 seconds as fallback (in case socket fails)
    const refreshInterval = setInterval(fetchLocations, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [busId, buses]);

  return (
    <div className="w-full h-full relative">
      {/* Connection status indicator */}
      <div className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-xs font-medium text-gray-700">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={13} />
        {buses.map((bus) => {
          const location = locations[bus.id];
          if (!location) return null;

          const lastUpdateTime = lastUpdate[bus.id];
          const isStale = lastUpdateTime && (Date.now() - lastUpdateTime > 30000); // 30 seconds

          return (
            <Marker
              key={bus.id}
              position={[location.lat, location.lng]}
              icon={busIcon}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[bus.id] = ref;
                }
              }}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <strong className="text-base">🚌 {bus.number_plate}</strong>
                  {bus.driver && (
                    <>
                      <br />
                      <span className="text-sm text-gray-600">Driver: {bus.driver.name}</span>
                    </>
                  )}
                  <br />
                  <span className="text-sm">Speed: <strong>{Math.round(location.speed || 0)}</strong> km/h</span>
                  <br />
                  {location.timestamp && (
                    <span className="text-xs text-gray-500 block mt-1">
                      Updated: {new Date(location.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {isStale && (
                    <span className="text-xs text-yellow-600 block mt-1">
                      ⚠️ Location may be outdated
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
