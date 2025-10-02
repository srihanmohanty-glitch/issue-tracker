import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ChangePasswordModal from './ChangePasswordModal';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // <-- Added for display
  role: 'user' | 'admin' | 'manager';
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
  status?: string; // <-- Added for display
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

  // Fallback for debugging
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>User not found.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      setLoading(true);
      try {
        if (isAdmin) {
          await fetchUsers();
          await fetchStats();
        } else {
          await fetchCurrentUser();
        }
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [isAdmin, currentPage, searchTerm]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
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
      // TODO: Implement actual API call
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
      // TODO: Implement actual API call
      // const response = await fetch('/api/users/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      setError('Failed to fetch stats.');
    }
  };

  // Helper to get display name
  const getDisplayName = (u: User) => {
    if (u.name) return u.name;
    if (u.firstName || u.lastName) return [u.firstName, u.lastName].filter(Boolean).join(' ');
    return 'N/A';
  };

  // Example render for admin
  if (isAdmin) {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Account Management</h2>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowCreateModal(true)}
        >
          Create User
        </button>
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td className="py-2 px-4 border-b">{getDisplayName(u)}</td>
                  <td className="py-2 px-4 border-b">{u.email ?? 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{u.role ?? 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{u.profile?.department ?? 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                    {typeof u.isActive === 'boolean'
                      ? (u.isActive ? 'Active' : 'Inactive')
                      : (u.status ?? 'N/A')}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="text-blue-500 hover:underline mr-2"
                      onClick={() => {
                        setEditingUser(u);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => {
                        // handleDeleteUser(u._id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination controls */}
        <div className="mt-4 flex justify-between">
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
        {/* Modals */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onUserCreated={fetchUsers}
          />
        )}
        {showEditModal && editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setShowEditModal(false)}
            onUserUpdated={fetchUsers}
          />
        )}
        {showPasswordModal && editingUser && (
          <ChangePasswordModal
            user={editingUser}
            onClose={() => setShowPasswordModal(false)}
          />
        )}
      </div>
    );
  }

  // Render for non-admin users
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Account</h2>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {getDisplayName(currentUser ?? user)}</p>
        <p><strong>Email:</strong> {(currentUser?.email ?? user.email) ?? 'N/A'}</p>
        <p><strong>Role:</strong> {(currentUser?.role ?? user.role) ?? 'N/A'}</p>
        <p><strong>Department:</strong> {(currentUser?.profile?.department ?? user?.profile?.department) ?? 'N/A'}</p>
        <p><strong>Status:</strong> {typeof (currentUser?.isActive ?? user.isActive) === 'boolean'
          ? ((currentUser?.isActive ?? user.isActive) ? 'Active' : 'Inactive')
          : (currentUser?.status ?? user.status ?? 'N/A')}
        </p>
      </div>
    </div>
  );
};

export default AccountManager;
