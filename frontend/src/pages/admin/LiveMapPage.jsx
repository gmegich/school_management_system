import { useState, useEffect } from 'react';
import api from '../../services/api';
import LiveMap from '../../components/LiveMap';

const LiveMapPage = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await api.get('/bus');
        // Only show buses with tracking enabled
        const trackedBuses = (response.data.buses || []).filter(bus => bus.tracking_enabled);
        setBuses(trackedBuses);
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const handleBusSelect = (busId) => {
    setSelectedBusId(busId);
  };

  const handleBack = () => {
    setSelectedBusId(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading buses...</div>
        </div>
      </div>
    );
  }

  // Show map if bus is selected
  if (selectedBusId) {
    const selectedBus = buses.find(b => b.id === selectedBusId);
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold">Live Map</h1>
          </div>
          {selectedBus && (
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold">Tracking: {selectedBus.number_plate}</span>
                {selectedBus.routes?.name && (
                  <span className="text-blue-100">• {selectedBus.routes.name}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <LiveMap busId={selectedBusId} />
        </div>
      </div>
    );
  }

  // Show bus selection interface
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Map</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <div className="mb-10">
              <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  className="w-16 h-16 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
                Select a bus to view on map
              </h2>
              <p className="text-gray-500 text-center text-lg">
                Choose a bus from the list below to track its live location
              </p>
            </div>

            <div className="w-full max-w-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
                Select a bus
              </label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBusSelect(parseInt(e.target.value));
                    }
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white cursor-pointer transition-all hover:border-gray-400"
                >
                  <option value="">Select a bus...</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.number_plate} {bus.routes?.name ? `- ${bus.routes.name}` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {buses.length === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 text-center">
                    No buses with tracking enabled. Please enable tracking for at least one bus.
                  </p>
                </div>
              )}

              {buses.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 text-center">
                    {buses.length} bus{buses.length !== 1 ? 'es' : ''} available for tracking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;

