import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('parent');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegistering) {
      // Handle registration
      try {
        const response = await api.post('/auth/register', {
          name,
          email,
          password,
          role,
        });
        
        setSuccess('Account created successfully! Please login.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setName('');
        setRole('parent');
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle login
      const result = await login(email, password);

      if (result.success) {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          setError('Login failed: User data not found');
          setLoading(false);
          return;
        }
        
        let user;
        try {
          user = JSON.parse(savedUser);
        } catch (err) {
          setError('Login failed: Invalid user data');
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'driver') {
          navigate('/driver');
        } else if (user.role === 'parent') {
          navigate('/parent');
        }
      } else {
        setError(result.error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">School Bus Management</h1>
        <h2 className="text-xl text-center mb-8 text-gray-600">
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isRegistering ? "Password (min 6 characters)" : "Enter your password"}
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="parent">Parent</option>
                <option value="driver">Driver</option>
                <option value="admin" disabled>Admin (Contact administrator)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Note: Admin accounts can only be created by existing administrators.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (isRegistering ? 'Creating account...' : 'Logging in...') 
              : (isRegistering ? 'Create Account' : 'Login')
            }
          </button>
        </form>

        <div className="mt-4 text-center">
          {isRegistering ? (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                  setSuccess('');
                  setName('');
                  setRole('parent');
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Create one here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

