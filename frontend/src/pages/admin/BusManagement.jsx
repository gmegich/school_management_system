import { useState, useEffect } from 'react';
import api from '../../services/api';
import { kabarakRoutes } from '../../data/kabarakRoutes';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    number_plate: '',
    capacity: '',
    route_name: '',
    driver_id: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [busesRes, driversRes, routesRes] = await Promise.all([
        api.get('/bus'),
        api.get('/users').catch(() => ({ data: { users: [] } })),
        api.get('/routes'),
      ]);

      setBuses(busesRes.data.buses || []);
      setDrivers((driversRes.data.users || []).filter(u => u.role === 'driver'));
      setSavedRoutes(routesRes.data.routes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find or create the route
      let routeId = null;
      let selectedRoute = null;
      if (formData.route_name) {
        const existingRoute = savedRoutes.find(r => r.name === formData.route_name);
        if (existingRoute) {
          routeId = existingRoute.id;
          selectedRoute = existingRoute;
        } else {
          // Create the route if it doesn't exist
          const routeData = kabarakRoutes.find(r => r.name === formData.route_name);
          if (routeData) {
            const routeRes = await api.post('/routes', {
              name: routeData.name,
              stops: routeData.stops,
            });
            routeId = routeRes.data.route.id;
            selectedRoute = routeRes.data.route;
            setSavedRoutes([...savedRoutes, routeRes.data.route]);
          }
        }
      }

      const payload = {
        number_plate: formData.number_plate,
        capacity: parseInt(formData.capacity),
        route_id: routeId,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
        status: formData.status || 'active',
      };

      let response;
      if (editingBus) {
        response = await api.put(`/bus/${editingBus.id}`, payload);
      } else {
        response = await api.post('/bus', payload);
      }

      // Optimistically update the local state immediately
      const updatedBus = response.data.bus;
      if (editingBus) {
        // Update existing bus
        setBuses((prev) =>
          prev.map((bus) =>
            bus.id === editingBus.id
              ? {
                  ...updatedBus,
                  routes: selectedRoute || bus.routes,
                }
              : bus
          )
        );
      } else {
        // Add new bus
        setBuses((prev) => [
          ...prev,
          {
            ...updatedBus,
            routes: selectedRoute,
          },
        ]);
      }

      setShowModal(false);
      setEditingBus(null);
      setFormData({ number_plate: '', capacity: '', route_name: '', driver_id: '', status: 'active' });
      
      // Refresh data in background to ensure consistency
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error saving bus';
      const errorDetails = error.response?.data?.details;
      
      // Revert optimistic update on error
      fetchData();
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const detailsText = errorDetails.map(d => `${d.path.join('.')}: ${d.message}`).join('\n');
        alert(`${errorMessage}\n\nDetails:\n${detailsText}`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      number_plate: bus.number_plate || '',
      capacity: bus.capacity || '',
      route_name: bus.routes?.name || '',
      driver_id: bus.driver_id || '',
      status: bus.status || 'active',
    });
    setShowModal(true);
  };

  const handleStatusChange = async (busId, newStatus) => {
    // Optimistically update the status immediately
    setBuses((prev) =>
      prev.map((bus) =>
        bus.id === busId ? { ...bus, status: newStatus } : bus
      )
    );

    try {
      const response = await api.put(`/bus/${busId}`, { status: newStatus });
      // Update with server response to ensure consistency
      const updatedBus = response.data.bus;
      setBuses((prev) =>
        prev.map((bus) =>
          bus.id === busId ? updatedBus : bus
        )
      );
    } catch (error) {
      // Revert on error
      fetchData();
      alert(error.response?.data?.error || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    // Optimistically remove from UI
    const busToDelete = buses.find(b => b.id === id);
    setBuses((prev) => prev.filter((bus) => bus.id !== id));

    try {
      await api.delete(`/bus/${id}`);
    } catch (error) {
      // Revert on error
      if (busToDelete) {
        setBuses((prev) => [...prev, busToDelete].sort((a, b) => a.id - b.id));
      }
      alert(error.response?.data?.error || 'Error deleting bus');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bus Management</h1>
        <button
          onClick={() => {
            setEditingBus(null);
            setFormData({ number_plate: '', capacity: '', route_name: '', driver_id: '', status: 'active' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Bus
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number Plate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buses.map((bus) => (
              <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{bus.number_plate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bus.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bus.routes?.name || 'Not assigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {bus.driver ? (
                    <div>
                      <div className="font-medium">{bus.driver.name}</div>
                      <div className="text-xs text-gray-500">{bus.driver.email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={bus.status || 'active'}
                    onChange={(e) => handleStatusChange(bus.id, e.target.value)}
                    className={`px-3 py-1 text-xs rounded-full border-0 font-medium cursor-pointer transition-colors ${
                      bus.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : bus.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : bus.status === 'out_of_service'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bus.tracking_enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {bus.tracking_enabled ? '📍 Enabled' : '🚫 Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(bus)}
                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bus.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {buses.map((bus) => (
          <div key={bus.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{bus.number_plate}</h3>
                <p className="text-sm text-gray-600">Capacity: {bus.capacity} students</p>
              </div>
              <select
                value={bus.status || 'active'}
                onChange={(e) => handleStatusChange(bus.id, e.target.value)}
                className={`px-3 py-1 text-xs rounded-full border-0 font-medium cursor-pointer ${
                  bus.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : bus.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : bus.status === 'out_of_service'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Route:</span>{' '}
                <span className="font-medium">{bus.routes?.name || 'Not assigned'}</span>
              </div>
              <div>
                <span className="text-gray-600">Driver:</span>{' '}
                {bus.driver ? (
                  <div>
                    <span className="font-medium">{bus.driver.name}</span>
                    <div className="text-xs text-gray-500">{bus.driver.email}</div>
                  </div>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </div>
              <div>
                <span className="text-gray-600">Tracking:</span>{' '}
                <span className={bus.tracking_enabled ? 'text-green-600' : 'text-gray-600'}>
                  {bus.tracking_enabled ? '📍 Enabled' : '🚫 Disabled'}
                </span>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 pt-4 border-t">
              <button
                onClick={() => handleEdit(bus)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(bus.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number Plate</label>
                <input
                  type="text"
                  value={formData.number_plate}
                  onChange={(e) => setFormData({ ...formData, number_plate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., KCA 123A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Route</option>
                  {kabarakRoutes.map((route) => (
                    <option key={route.name} value={route.name}>
                      {route.name} ({route.stops.length} stops)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  {editingBus ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBus(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;

