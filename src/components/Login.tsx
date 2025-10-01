import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import HealthCheck from './HealthCheck';

const Login = () => {
  const navigate = useNavigate();
  const { login, isValidating } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // No auto-redirect - users stay on login page even when logged in

  // Show loading while validating token
  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = isRegistering 
        ? await auth.register(formData.email, formData.password)
        : await auth.login(formData.email, formData.password);
      
      localStorage.setItem('token', response.token);
      login(response.user.role, response.user);

      // Redirect to issues dashboard after successful login
      navigate('/issues');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || `Error ${isRegistering ? 'registering' : 'logging in'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isRegistering ? 'Register' : 'Login'}</h2>
      
      {/* Health Check */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <HealthCheck />
      </div>
      
      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="w-full text-center text-sm text-primary-600 hover:text-primary-800"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>

        <div className="text-sm text-gray-600 mt-4">
        <p>Login Using Your USERNAME AND PASSWORD.</p>
          <p>Copyright © 2025 Helpcenter.</p>
          <p>© All Rights Reserved. © Refers to Helpcenter and/or its subsidiaries.</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
