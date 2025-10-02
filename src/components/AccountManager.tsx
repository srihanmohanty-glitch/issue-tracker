import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accounts } from '../services/api';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ChangePasswordModal from './ChangePasswordModal';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'manager'
  ;
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockUntil?: string;
  profile: {
    department?: string;
    phone?: string;
    timezone?: string;
    language?: string;
  };
  activity: {
    totalLogins: number;
    lastActivity: string;
    issuesCreated: number;
    issuesResolved: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  recentLogins: number;
  lockedAccounts: number;
}

const AccountManager = () => {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  // Debug logging
  console.log('AccountManager rendered:', { isAdmin, user: user?.email, loading });

  // Simple fallback for debugging
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>User not found.</p>
      </div>
    );
  }

  useEffect(() => {
    console.log('AccountManager useEffect triggered:', { isAdmin, user: user?.email, currentPage, searchTerm });
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    } else {
      fetchCurrentUser();
    }
    // eslint-disable-next-line
  }, [isAdmin, currentPage, searchTerm]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      // Fetch current user data from API
      // const response = await fetch('/api/users/me');
      // const data = await response.json();
      // setCurrentUser(data);
    } catch (error) {
      setError('Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users data from API
      // const response = await fetch(`/api/users?page=${currentPage}&search=${searchTerm}`);
      // const data = await response.json();
      // setUsers(data.users);
      // setTotalPages(data.totalPages);
    } catch (error) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch stats data from API
      // const response = await fetch('/api/users/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      setError('Failed to fetch stats.');
    }
  };

  // Example render for admin
  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Account Management</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Department</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border-b">{user.name ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">{user.email ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">{user.role ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">{user?.profile?.department ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">{user.status ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {/* Actions: Edit, Delete, etc. */}
                  <button
                    className="text-blue-500 hover:underline mr-2"
                    onClick={() => {
                      setEditingUser(user);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => {
                      // handleDeleteUser(user._id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Modals for create/edit/password can go here */}
      </div>
    );
  }

  // Render for non-admin users
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Account</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {currentUser?.name ?? user.name ?? 'N/A'}</p>
        <p><strong>Email:</strong> {currentUser?.email ?? user.email ?? 'N/A'}</p>
        <p><strong>Role:</strong> {currentUser?.role ?? user.role ?? 'N/A'}</p>
        <p><strong>Department:</strong> {currentUser?.profile?.department ?? user?.profile?.department ?? 'N/A'}</p>
        <p><strong>Status:</strong> {currentUser?.status ?? user.status ?? 'N/A'}</p>
      </div>
    </div>
  );
};

export default AccountManager;
