import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BusManagement from './pages/admin/BusManagement';
import RouteManagement from './pages/admin/RouteManagement';
import StudentManagement from './pages/admin/StudentManagement';
import LiveMapPage from './pages/admin/LiveMapPage';
import DriverDashboard from './pages/DriverDashboard';
import DriverLiveMapPage from './pages/driver/LiveMapPage';
import AttendancePage from './pages/driver/AttendancePage';
import ParentDashboard from './pages/ParentDashboard';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="buses" element={<BusManagement />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="map" element={<LiveMapPage />} />
      </Route>

      <Route
        path="/driver"
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="map" element={<DriverLiveMapPage />} />
      </Route>

      <Route
        path="/parent"
        element={
          <PrivateRoute allowedRoles={['parent']}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<ParentDashboard />} />
      </Route>

      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'driver'
                  ? '/driver'
                  : '/parent'
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

