import { useState, useEffect } from 'react';
import api from '../../services/api';
import LiveMap from '../../components/LiveMap';
import { getSocket } from '../../services/socket';

const DriverLiveMapPage = () => {
  const [bus, setBus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await api.get('/bus');
        if (response.data.buses?.length > 0) {
          const driverBus = response.data.buses[0];
          setBus(driverBus);
          setTrackingEnabled(driverBus.tracking_enabled || false);
        }
      } catch (error) {
        console.error('Error fetching bus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please use a modern browser.');
      return;
    }

    if (!bus) {
      alert('No bus assigned. Cannot start tracking.');
      return;
    }

    setIsTracking(true);
    const socket = getSocket();
    let lastSentTime = 0;
    const THROTTLE_INTERVAL = 2000; // Send update every 2 seconds max

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        // Throttle updates to prevent too many API calls
        if (now - lastSentTime < THROTTLE_INTERVAL) {
          return;
        }
        lastSentTime = now;

        const { latitude, longitude } = position.coords;
        const speed = position.coords.speed || 0;
        const timestamp = new Date().toISOString();

        // Send to backend
        api.post('/gps', {
          bus_id: bus.id,
          latitude,
          longitude,
          speed: speed * 3.6, // Convert m/s to km/h
        }).catch((err) => {
          console.error('Error sending location to server:', err);
        });

        // Broadcast via socket for immediate real-time updates
        socket.emit('location-update', {
          busId: bus.id,
          latitude,
          longitude,
          speed: speed * 3.6,
          timestamp,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Error getting location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. Please check your GPS/network connection.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Unknown error occurred. Please check your browser settings.';
            break;
        }
        
        alert(errorMessage);
        setIsTracking(false);
        
        // Clear watch if it was set
        if (window.driverWatchId) {
          navigator.geolocation.clearWatch(window.driverWatchId);
          window.driverWatchId = null;
        }
      },
      {
        enableHighAccuracy: true, // Enable high accuracy for precise tracking
        timeout: 5000, // 5 second timeout for faster updates
        maximumAge: 0, // Always get fresh location, no cache
      }
    );

    // Store watchId to stop later
    window.driverWatchId = watchId;
  };

  const stopTracking = () => {
    if (window.driverWatchId) {
      navigator.geolocation.clearWatch(window.driverWatchId);
      window.driverWatchId = null;
    }
    setIsTracking(false);
  };

  const toggleTracking = async () => {
    if (!bus) return;
    
    try {
      const newStatus = !trackingEnabled;
      await api.put(`/bus/${bus.id}`, {
        tracking_enabled: newStatus,
      });
      setTrackingEnabled(newStatus);
      setBus({ ...bus, tracking_enabled: newStatus });
      
      if (!newStatus && isTracking) {
        stopTracking();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating tracking status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">No bus assigned to you.</p>
            <p className="text-gray-500 mt-2">Please contact an administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Map</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${trackingEnabled ? 'text-green-600' : 'text-gray-600'}`}>
              {trackingEnabled ? '📍 Tracking Enabled' : '🚫 Tracking Disabled'}
            </span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <button
                onClick={toggleTracking}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  trackingEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    trackingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Bus: {bus.number_plate}</h2>
            {bus.routes && (
              <p className="text-gray-600">Route: {bus.routes.name}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {isTracking && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Tracking Active</span>
              </div>
            )}
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!trackingEnabled}
                className="bg-blue-600 text-white px-6 py-2.5 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Start Tracking</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 text-white px-6 py-2.5 rounded hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Stop Tracking</span>
              </button>
            )}
          </div>
        </div>
        {!trackingEnabled && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Enable tracking above to allow admins and parents to see your location on the map.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 350px)' }}>
        <LiveMap busId={bus.id} />
      </div>
    </div>
  );
};

export default DriverLiveMapPage;

