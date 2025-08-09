import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Shield, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Key
} from 'lucide-react';
import { api } from '../utils/api';

interface User {
  email: string;
  status: 'active' | 'inactive';
  privileges: string[];
  quota: string;
  mailbox: string;
  password?: string; // For editing only
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    privileges: 'user',
    quota: '0'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/mail/users?format=json');
      if (response.success && Array.isArray(response.data)) {
        // Flatten the domain-based structure into a simple array of users
        const allUsers: User[] = [];
        response.data.forEach((domain: any) => {
          if (domain.users && Array.isArray(domain.users)) {
            domain.users.forEach((user: any) => {
              allUsers.push({
                email: user.email || '',
                status: user.status || 'active',
                privileges: Array.isArray(user.privileges) ? user.privileges : [],
                quota: user.quota || '0',
                mailbox: user.mailbox || ''
              });
            });
          }
        });
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('privileges', newUser.privileges === 'admin' ? 'admin' : '');
      formData.append('quota', newUser.quota);

      const response = await api.post('/mail/users/add', formData);

      if (response.success) {
        await fetchUsers();
        setNewUser({ email: '', password: '', privileges: 'user', quota: '0' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to delete the user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', userEmail);

      const response = await api.post('/mail/users/remove', formData);

      if (response.success) {
        await fetchUsers();
      } else {
        alert('Failed to delete user: ' + response.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      // Update password if provided
      if (editingUser.password) {
        const passwordFormData = new FormData();
        passwordFormData.append('email', editingUser.email);
        passwordFormData.append('password', editingUser.password);
        
        await api.post('/mail/users/password', passwordFormData);
      }

      // Update quota
      const quotaFormData = new FormData();
      quotaFormData.append('email', editingUser.email);
      quotaFormData.append('quota', editingUser.quota || '0');
      
      await api.post('/mail/users/quota', quotaFormData);

      // Update privileges
      const currentPrivileges = editingUser.privileges || [];
      const shouldBeAdmin = currentPrivileges.includes('admin');
      
      // Remove admin privilege if user shouldn't have it
      if (!shouldBeAdmin && users.find(u => u.email === editingUser.email)?.privileges?.includes('admin')) {
        const removeAdminFormData = new FormData();
        removeAdminFormData.append('email', editingUser.email);
        removeAdminFormData.append('privilege', 'admin');
        await api.post('/mail/users/privileges/remove', removeAdminFormData);
      }
      
      // Add admin privilege if user should have it
      if (shouldBeAdmin && !users.find(u => u.email === editingUser.email)?.privileges?.includes('admin')) {
        const addAdminFormData = new FormData();
        addAdminFormData.append('email', editingUser.email);
        addAdminFormData.append('privilege', 'admin');
        await api.post('/mail/users/privileges/add', addAdminFormData);
      }

      await fetchUsers();
      setShowEditForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user =>
    user && user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">Manage email accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Add New User</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@domain.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    title="Generate random password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.privileges}
                  onChange={(e) => setNewUser({ ...newUser, privileges: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quota (0 = unlimited)
                </label>
                <input
                  type="text"
                  value={newUser.quota}
                  onChange={(e) => setNewUser({ ...newUser, quota: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add User
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Passwords must be at least 8 characters with letters and numbers</li>
              <li>• Administrators get access to this control panel</li>
              <li>• Use aliases to create forwarding addresses</li>
              <li>• Quota suffixes: G (gigabytes), M (megabytes)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Edit User: {editingUser.email}</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingUser(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let password = '';
                      for (let i = 0; i < 12; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setEditingUser({ ...editingUser, password });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    title="Generate random password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={editingUser.privileges.includes('admin') ? 'admin' : 'user'}
                  onChange={(e) => {
                    const isAdmin = e.target.value === 'admin';
                    setEditingUser({ 
                      ...editingUser, 
                      privileges: isAdmin ? ['admin'] : [] 
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quota (0 = unlimited)
                </label>
                <input
                  type="text"
                  value={editingUser.quota || '0'}
                  onChange={(e) => setEditingUser({ ...editingUser, quota: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Update User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search users..."
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Existing Users ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? (
                        <UserCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <UserX className="w-3 h-3 mr-1" />
                      )}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.privileges.includes('admin')
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {user.privileges.includes('admin') ? (
                        <Shield className="w-3 h-3 mr-1" />
                      ) : (
                        <Mail className="w-3 h-3 mr-1" />
                      )}
                      {user.privileges.includes('admin') ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.quota || 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Edit user"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.email)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
