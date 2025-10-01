import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Issue Tracker
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md"
            >
              Issues
            </Link>
            <Link
              to="/submit-issue"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md"
            >
              Submit Issue
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md"
                >
                  Admin
                </Link>
                <Link
                  to="/accounts"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md"
                >
                  Accounts
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="btn-primary"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;