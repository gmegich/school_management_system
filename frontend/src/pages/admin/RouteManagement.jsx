import { useState, useEffect } from 'react';
import api from '../../services/api';
import { kabarakRoutes } from '../../data/kabarakRoutes';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async () => {
    if (!selectedRoute) {
      alert('Please select a route to add');
      return;
    }

    const routeData = kabarakRoutes.find(r => r.name === selectedRoute);
    if (!routeData) return;

    // Check if route already exists
    const exists = routes.find(r => r.name === routeData.name);
    if (exists) {
      alert('This route already exists');
      return;
    }

    try {
      await api.post('/routes', {
        name: routeData.name,
        stops: routeData.stops,
      });
      setSelectedRoute('');
      setShowModal(false);
      fetchRoutes();
      alert('Route added successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting route');
    }
  };

  // Get routes that are not yet added
  const availableRoutes = kabarakRoutes.filter(
    route => !routes.some(r => r.name === route.name)
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Route Management</h1>
        <button
          onClick={() => {
            setSelectedRoute('');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Route
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of Stops</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{route.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{route.stops?.length || 0}</td>
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    {route.stops?.map((stop, idx) => (
                      <span key={idx} className="text-sm text-gray-600">
                        {stop.name}
                        {idx < route.stops.length - 1 && ' → '}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(route.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {routes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No routes added yet. Add a route using the button above.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Route</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddRoute(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a route to add...</option>
                  {availableRoutes.map((route) => (
                    <option key={route.name} value={route.name}>
                      {route.name} ({route.stops.length} stops)
                    </option>
                  ))}
                </select>
                {availableRoutes.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">All pre-defined routes have been added.</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={!selectedRoute || availableRoutes.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Route
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoute('');
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

export default RouteManagement;

