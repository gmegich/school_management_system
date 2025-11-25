import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    drivers: 0,
    routes: 0,
    activeBuses: 0,
    totalBuses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [busesRes, routesRes, studentsRes, usersRes] = await Promise.all([
          api.get('/bus'),
          api.get('/routes'),
          api.get('/students'),
          api.get('/users'),
        ]);

        const buses = busesRes.data.buses || [];
        const activeBuses = buses.filter(
          (bus) => bus.status === 'active' || bus.tracking_enabled
        ).length;
        const drivers = (usersRes.data.users || []).filter(
          (user) => user.role === 'driver'
        ).length;

        setStats({
          students: studentsRes.data.students?.length || 0,
          drivers: drivers,
          routes: routesRes.data.routes?.length || 0,
          activeBuses: activeBuses,
          totalBuses: buses.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome back {user?.name || user?.email || 'Admin'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-medium">{user?.name || user?.email || 'Admin'}</span>
                <span className="text-gray-500 capitalize">{user?.role || 'Admin'}</span>
                <svg
                  className="w-4 h-4 text-gray-500"
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
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Students Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="w-16 h-16 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.students}</p>
              <p className="text-gray-600 font-medium">STUDENTS</p>
            </div>
          </div>

          {/* Drivers Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.drivers}</p>
              <p className="text-gray-600 font-medium">DRIVERS</p>
            </div>
          </div>

          {/* Routes Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.routes}</p>
              <p className="text-gray-600 font-medium">ROUTES</p>
            </div>
          </div>

          {/* Active Buses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.activeBuses}</p>
              <p className="text-gray-600 font-medium">ACTIVE BUSES</p>
            </div>
          </div>

          {/* Total Buses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 md:col-span-2">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-4H4V6h14v7z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalBuses}</p>
              <p className="text-gray-600 font-medium">TOTAL BUSES</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
