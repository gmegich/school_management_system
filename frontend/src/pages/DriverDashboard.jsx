import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import LiveMap from '../components/LiveMap';

const DriverDashboard = () => {
  const [bus, setBus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const busRes = await api.get('/bus');

        if (busRes.data.buses?.length > 0) {
          const driverBus = busRes.data.buses[0];
          setBus(driverBus);
          setTrackingEnabled(driverBus.tracking_enabled || false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      alert(newStatus ? '✅ Tracking enabled. Admin and parents can now track this bus.' : '❌ Tracking disabled.');
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating tracking status');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!bus) {
    return (
      <div className="p-4">
        <p className="text-red-600">No bus assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>

      {/* Bus Info Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Assigned Bus</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="text-gray-600">Bus Number:</span>{' '}
                <strong className="text-xl">{bus.number_plate}</strong>
              </p>
              {bus.routes && (
                <p className="text-gray-600">
                  <span className="font-medium">Route:</span> {bus.routes.name}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Capacity:</span> {bus.capacity} students
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-2">
              <span className={`text-sm font-medium ${trackingEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {trackingEnabled ? '📍 Tracking Enabled' : '🚫 Tracking Disabled'}
              </span>
            </div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-sm text-gray-600">Allow Tracking</span>
              <button
                onClick={toggleTracking}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  trackingEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    trackingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* GPS Tracking Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Live GPS Tracking</h2>
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
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
          <LiveMap busId={bus.id} />
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

