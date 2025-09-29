import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = isRegistering 
        ? await auth.register(formData.email, formData.password)
        : await auth.login(formData.email, formData.password);
      
      localStorage.setItem('token', response.token);
      login(response.user.role);

      // Always navigate to home page first
      navigate('/');
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
          <p>Demo Credentials:</p>
          <p>Admin: admin@helpcenter.com / admin123</p>
          <p>User: user@helpcenter.com / user123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
