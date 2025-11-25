import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import Notification from '../components/Notification';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const notificationShownRef = useRef({}); // Track which notifications we've shown

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    route_id: '',
    bus_id: '',
  });
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    grade: '',
    route_id: '',
    bus_id: '',
  });
  
  // Selected bus and driver info for display
  const [selectedBusInfo, setSelectedBusInfo] = useState(null);
  const [selectedEditBusInfo, setSelectedEditBusInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, attendanceRes, busesRes, routesRes] = await Promise.all([
          api.get('/students'),
          api.get('/attendance'),
          api.get('/bus'),
          api.get('/routes'),
        ]);

        setChildren(studentsRes.data.students || []);
        setAttendance(attendanceRes.data.attendance || []);
        setBuses(busesRes.data.buses || []);
        setRoutes(routesRes.data.routes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get user's current location for proximity calculations
  useEffect(() => {
    if (navigator.geolocation && children.length > 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [children]);

  // Listen for bus location updates and check proximity
  useEffect(() => {
    if (!userLocation || children.length === 0) return;

    const socket = getSocket();
    const PROXIMITY_THRESHOLD = 2; // 2 km

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const handleLocationUpdate = (data) => {
      // Check if this bus is assigned to any of the parent's children
      const relevantChild = children.find((child) => child.bus_id === data.busId);
      
      if (relevantChild && data.latitude && data.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.latitude,
          data.longitude
        );

        // Create a unique key for this notification
        const notificationKey = `${data.busId}-${Math.floor(distance * 10)}`;

        // Only show notification if within 2km and we haven't shown it recently
        if (distance <= PROXIMITY_THRESHOLD && !notificationShownRef.current[notificationKey]) {
          notificationShownRef.current[notificationKey] = true;
          
          // Request browser notification permission and show notification
          if ('Notification' in window) {
            if (window.Notification.permission === 'granted') {
              new window.Notification('🚌 Bus Approaching!', {
                body: `Your child's bus is ${distance.toFixed(1)} km away`,
                icon: '/favicon.ico',
              });
            } else if (window.Notification.permission === 'default') {
              window.Notification.requestPermission();
            }
          }

          // Add to notifications list
          const notification = {
            id: Date.now(),
            message: `🚌 Bus ${relevantChild.buses?.number_plate || 'assigned to your child'} is ${distance.toFixed(1)} km away`,
            type: 'info',
          };
          setNotifications((prev) => [...prev, notification]);

          // Clear notification after 10 seconds
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 10000);
        }

        // Reset notification flag if bus moves away
        if (distance > PROXIMITY_THRESHOLD + 0.5) {
          delete notificationShownRef.current[notificationKey];
        }
      }
    };

    socket.on('location-update', handleLocationUpdate);

    // Request notification permission
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }

    // Join bus rooms for all children's buses
    children.forEach((child) => {
      if (child.bus_id) {
        socket.emit('join-bus-room', child.bus_id);
      }
    });

    return () => {
      socket.off('location-update', handleLocationUpdate);
      children.forEach((child) => {
        if (child.bus_id) {
          socket.emit('leave-bus-room', child.bus_id);
        }
      });
    };
  }, [userLocation, children]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/students', {
        name: formData.name,
        grade: formData.grade,
        parent_id: user.id,
        bus_id: formData.bus_id ? parseInt(formData.bus_id) : null,
      });

      setChildren([...children, response.data.student]);
      setFormData({ name: '', grade: '', route_id: '', bus_id: '' });
      setSelectedBusInfo(null);
      setShowRegisterForm(false);
      
      // Show success notification
      const notification = {
        id: Date.now(),
        message: `✅ Student ${response.data.student.name} registered successfully!`,
        type: 'success',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    } catch (error) {
      const notification = {
        id: Date.now(),
        message: `❌ Error: ${error.response?.data?.error || 'Failed to register student'}`,
        type: 'error',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/students/${editingChildId}`, {
        name: editFormData.name,
        grade: editFormData.grade,
        bus_id: editFormData.bus_id ? parseInt(editFormData.bus_id) : null,
      });

      // Update the child in the children array
      setChildren(children.map(child => 
        child.id === editingChildId ? response.data.student : child
      ));
      
      setEditFormData({ name: '', grade: '', route_id: '', bus_id: '' });
      setSelectedEditBusInfo(null);
      setEditingChildId(null);
      
      // Show success notification
      const notification = {
        id: Date.now(),
        message: `✅ Student ${response.data.student.name} updated successfully!`,
        type: 'success',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    } catch (error) {
      const notification = {
        id: Date.now(),
        message: `❌ Error: ${error.response?.data?.error || 'Failed to update student'}`,
        type: 'error',
      };
      setNotifications((prev) => [...prev, notification]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    }
  };

  const handleStartEdit = (child) => {
    // Use child's bus data if available, otherwise find in buses array
    const childBus = child.buses || buses.find(b => b.id === child.bus_id);
    const routeId = childBus?.routes?.id || childBus?.route_id || '';
    
    setEditFormData({
      name: child.name,
      grade: child.grade,
      route_id: routeId ? routeId.toString() : '',
      bus_id: child.bus_id ? child.bus_id.toString() : '',
    });
    
    // Set selected bus info if bus exists
    if (childBus) {
      setSelectedEditBusInfo({
        vehicle: childBus.number_plate,
        driver: childBus.driver?.name || 'Not assigned',
        driverEmail: childBus.driver?.email || 'N/A',
      });
    } else {
      setSelectedEditBusInfo(null);
    }
    
    setEditingChildId(child.id);
  };

  const handleCancelEdit = () => {
    setEditingChildId(null);
    setEditFormData({ name: '', grade: '', route_id: '', bus_id: '' });
    setSelectedEditBusInfo(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'route_id') {
      // When route is selected, find the bus assigned to that route
      const selectedRouteId = parseInt(value);
      const busForRoute = buses.find(bus => bus.route_id === selectedRouteId);
      
      if (busForRoute) {
        setEditFormData({
          ...editFormData,
          route_id: value,
          bus_id: busForRoute.id.toString(),
        });
        setSelectedEditBusInfo({
          vehicle: busForRoute.number_plate,
          driver: busForRoute.driver?.name || 'Not assigned',
          driverEmail: busForRoute.driver?.email || 'N/A',
        });
      } else {
        setEditFormData({
          ...editFormData,
          route_id: value,
          bus_id: '',
        });
        setSelectedEditBusInfo(null);
      }
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'route_id') {
      // When route is selected, find the bus assigned to that route
      const selectedRouteId = parseInt(value);
      const busForRoute = buses.find(bus => bus.route_id === selectedRouteId);
      
      if (busForRoute) {
        setFormData({
          ...formData,
          route_id: value,
          bus_id: busForRoute.id.toString(),
        });
        setSelectedBusInfo({
          vehicle: busForRoute.number_plate,
          driver: busForRoute.driver?.name || 'Not assigned',
          driverEmail: busForRoute.driver?.email || 'N/A',
        });
      } else {
        setFormData({
          ...formData,
          route_id: value,
          bus_id: '',
        });
        setSelectedBusInfo(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Parent Dashboard</h1>
        {!showRegisterForm && (
          <button
            onClick={() => setShowRegisterForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Register Student
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Register Student Form */}
      {showRegisterForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Register New Student</h2>
            <button
              onClick={() => {
                setShowRegisterForm(false);
                setFormData({ name: '', grade: '', route_id: '', bus_id: '' });
                setSelectedBusInfo(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Grade 1, Grade 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Display selected vehicle and driver information */}
            {selectedBusInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Assigned Vehicle & Driver</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Vehicle Number</p>
                    <p className="text-sm text-blue-900 font-semibold">{selectedBusInfo.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Driver Name</p>
                    <p className="text-sm text-blue-900 font-semibold">{selectedBusInfo.driver}</p>
                  </div>
                  {selectedBusInfo.driverEmail !== 'N/A' && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-blue-700 font-medium">Driver Contact</p>
                      <p className="text-sm text-blue-900">{selectedBusInfo.driverEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {formData.route_id && !selectedBusInfo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ No vehicle assigned to this route yet. Please contact the administrator.
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Register Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterForm(false);
                  setFormData({ name: '', grade: '', route_id: '', bus_id: '' });
                  setSelectedBusInfo(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children Information */}
      {children.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No children registered yet.</p>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Register Your First Student
          </button>
        </div>
      ) : (
        children.map((child) => {
          const childAttendance = attendance.filter((a) => a.student_id === child.id);
          const childBus = buses.find((b) => b.id === child.bus_id);

          return (
            <div key={child.id} className="space-y-6 mb-6">
              {/* Child Information Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Child Information</h2>
                  {editingChildId !== child.id && (
                    <button
                      onClick={() => handleStartEdit(child)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
                
                {editingChildId === child.id ? (
                  /* Edit Form */
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <input
                        type="text"
                        name="grade"
                        value={editFormData.grade}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Grade 1, Grade 2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="route_id"
                        value={editFormData.route_id}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a route</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Display selected vehicle and driver information */}
                    {selectedEditBusInfo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Assigned Vehicle & Driver</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-blue-700 font-medium">Vehicle Number</p>
                            <p className="text-sm text-blue-900 font-semibold">{selectedEditBusInfo.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-medium">Driver Name</p>
                            <p className="text-sm text-blue-900 font-semibold">{selectedEditBusInfo.driver}</p>
                          </div>
                          {selectedEditBusInfo.driverEmail !== 'N/A' && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-blue-700 font-medium">Driver Contact</p>
                              <p className="text-sm text-blue-900">{selectedEditBusInfo.driverEmail}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {editFormData.route_id && !selectedEditBusInfo && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ No vehicle assigned to this route yet. Please contact the administrator.
                        </p>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-lg font-medium">{child.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="text-lg font-medium">{child.grade}</p>
                    </div>
                    {childBus && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Bus Number</p>
                          <p className="text-lg font-medium">{childBus.number_plate}</p>
                        </div>
                        {childBus.routes && (
                          <div>
                            <p className="text-sm text-gray-600">Route</p>
                            <p className="text-lg font-medium">{childBus.routes.name}</p>
                          </div>
                        )}
                        {childBus.driver && (
                          <>
                            <div>
                              <p className="text-sm text-gray-600">Driver Name</p>
                              <p className="text-lg font-medium">{childBus.driver.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Driver Contact</p>
                              <p className="text-lg font-medium">{childBus.driver.email}</p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Live Bus Tracking */}
              {child.bus_id && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Live Bus Tracking</h2>
                  <div className="h-64 md:h-96 rounded-lg overflow-hidden">
                    <LiveMap busId={child.bus_id} />
                  </div>
                </div>
              )}

              {/* Attendance History */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
                {childAttendance.length === 0 ? (
                  <p className="text-gray-600">No attendance records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {childAttendance.slice(0, 10).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium capitalize">{record.type}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {record.buses && (
                          <p className="text-sm text-gray-600">
                            Bus: {record.buses.number_plate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ParentDashboard;
