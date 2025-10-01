import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isLoggedIn, isValidating, isAdmin } = useAuth();
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

      // Stay on login page after successful login
      // User can manually navigate to other pages via navbar
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.response?.data?.message || `Error ${isRegistering ? 'registering' : 'logging in'}`);
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
      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {isLoggedIn && !isValidating && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">✅ Successfully logged in!</p>
            <p className="text-sm mt-1">Welcome back! You can now navigate to other sections using the navbar above.</p>
            <div className="mt-3 space-y-2">
              <Link 
                to="/issues" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Issues Dashboard
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors ml-2"
                >
                  Go to Admin Dashboard
                </Link>
              )}
              <Link 
                to="/accounts" 
                className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
              >
                Manage Account
              </Link>
            </div>
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
