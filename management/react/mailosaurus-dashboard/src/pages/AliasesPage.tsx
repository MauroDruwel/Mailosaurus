import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AtSign, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  Mail,
  ArrowRight,
  Users
} from 'lucide-react';
import { api } from '../utils/api';

interface Alias {
  address: string;
  forwards_to: string;
  permitted_senders: string;
  auto: boolean;
}

export default function AliasesPage() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState({
    address: '',
    forwards_to: '',
    permitted_senders: '',
    update_if_exists: false
  });

  useEffect(() => {
    fetchAliases();
  }, []);

  const fetchAliases = async () => {
    try {
      const response = await api.get('/mail/aliases?format=json');
      if (response.success && Array.isArray(response.data)) {
        // Flatten the domain-based structure into a simple array of aliases
        const allAliases: Alias[] = [];
        response.data.forEach((domain: any) => {
          if (domain.aliases && Array.isArray(domain.aliases)) {
            domain.aliases.forEach((alias: any) => {
              allAliases.push({
                address: alias.address || '',
                forwards_to: alias.forwards_to || '',
                permitted_senders: alias.permitted_senders || '',
                auto: alias.auto || false
              });
            });
          }
        });
        setAliases(allAliases);
      }
    } catch (error) {
      console.error('Failed to fetch aliases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('address', newAlias.address);
      formData.append('forwards_to', newAlias.forwards_to);
      formData.append('permitted_senders', newAlias.permitted_senders);
      formData.append('update_if_exists', newAlias.update_if_exists ? '1' : '0');

      const response = await api.post('/mail/aliases/add', formData);

      if (response.success) {
        await fetchAliases();
        setNewAlias({ address: '', forwards_to: '', permitted_senders: '', update_if_exists: false });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add alias:', error);
    }
  };

  const handleRemoveAlias = async (address: string) => {
    if (!confirm(`Are you sure you want to remove the alias "${address}"?`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('address', address);

      const response = await api.post('/mail/aliases/remove', formData);

      if (response.success) {
        await fetchAliases();
      }
    } catch (error) {
      console.error('Failed to remove alias:', error);
    }
  };

  const filteredAliases = aliases.filter(alias =>
    alias && alias.address && alias.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alias && alias.forwards_to && alias.forwards_to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Email Aliases</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">Email Aliases</h1>
          <p className="text-slate-600 mt-1">Create forwarding addresses and manage email routing</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Alias</span>
        </button>
      </div>

      {/* Add Alias Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Add New Alias</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleAddAlias} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alias Address
                </label>
                <input
                  type="email"
                  value={newAlias.address}
                  onChange={(e) => setNewAlias({ ...newAlias, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="alias@domain.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Forwards To
                </label>
                <input
                  type="text"
                  value={newAlias.forwards_to}
                  onChange={(e) => setNewAlias({ ...newAlias, forwards_to: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="user@domain.com or user1@domain.com,user2@domain.com"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permitted Senders (optional)
                </label>
                <input
                  type="text"
                  value={newAlias.permitted_senders}
                  onChange={(e) => setNewAlias({ ...newAlias, permitted_senders: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="user@domain.com or leave empty for anyone"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAlias.update_if_exists}
                    onChange={(e) => setNewAlias({ ...newAlias, update_if_exists: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">Update if alias already exists</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add Alias
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
          
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Aliases create forwarding addresses that redirect to existing mailboxes</li>
              <li>• Multiple destinations can be comma-separated: user1@domain.com,user2@domain.com</li>
              <li>• Permitted senders restrict who can send through this alias</li>
              <li>• Leave permitted senders empty to allow anyone to send</li>
            </ul>
          </div>
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
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search aliases..."
          />
        </div>
      </div>

      {/* Aliases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Email Aliases ({filteredAliases.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Alias Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Forwards To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Permitted Senders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAliases.map((alias, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                        <AtSign className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{alias.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 break-words">{alias.forwards_to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {alias.permitted_senders || 'Anyone'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alias.auto 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {alias.auto ? (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Auto
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Manual
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveAlias(alias.address)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAliases.length === 0 && (
            <div className="text-center py-12">
              <AtSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No aliases found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}