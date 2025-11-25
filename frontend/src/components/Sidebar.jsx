import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/buses', label: 'Buses', icon: '🚌' },
    { path: '/admin/routes', label: 'Routes', icon: '🗺️' },
    { path: '/admin/students', label: 'Students', icon: '👥' },
    { path: '/admin/map', label: 'Live Map', icon: '📍' },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Dashboard', icon: '📊' },
    { path: '/driver/attendance', label: 'Attendance', icon: '✅' },
    { path: '/driver/map', label: 'Live Map', icon: '📍' },
  ];

  const parentLinks = [
    { path: '/parent', label: 'Dashboard', icon: '📊' },
    { path: '/parent/map', label: 'Track Bus', icon: '📍' },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'driver') return driverLinks;
    if (user?.role === 'parent') return parentLinks;
    return [];
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Bus Management</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.name || user?.email}</p>
        <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {getLinks().map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

