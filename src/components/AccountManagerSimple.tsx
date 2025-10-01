import { useAuth } from '../context/AuthContext';

const AccountManagerSimple = () => {
  const { isAdmin, user } = useAuth();

  console.log('AccountManagerSimple rendered:', { isAdmin, user: user?.email });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Manager</h1>
      <p className="text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2">
          <p><strong>User Email:</strong> {user?.email || 'No user'}</p>
          <p><strong>User Role:</strong> {user?.role || 'No role'}</p>
          <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {user?._id || 'No ID'}</p>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900">Component Status</h3>
        <p className="text-blue-700">AccountManager component is working correctly!</p>
      </div>
    </div>
  );
};

export default AccountManagerSimple;
