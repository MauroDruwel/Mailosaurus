import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  Settings,
  Info,
  CheckCircle
} from 'lucide-react';
import { api } from '../utils/api';

interface DNSRecord {
  qname: string;
  rtype: string;
  value: string;
  zone: string;
}

export default function CustomDNSPage() {
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    qname: '',
    rtype: 'A',
    value: ''
  });

  const recordTypes = [
    'A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'NS', 'PTR'
  ];

  useEffect(() => {
    fetchDNSData();
  }, []);

  const fetchDNSData = async () => {
    try {
      const [recordsResponse, zonesResponse] = await Promise.all([
        api.get('/dns/custom'),
        api.get('/dns/zones')
      ]);

      if (recordsResponse.success) {
        setDnsRecords(recordsResponse.data as DNSRecord[]);
      }

      if (zonesResponse.success) {
        setZones(zonesResponse.data as string[]);
      }
    } catch (error) {
      console.error('Failed to fetch DNS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post(`/dns/custom/${newRecord.qname}/${newRecord.rtype}`, newRecord.value);

      if (response.success) {
        await fetchDNSData();
        setNewRecord({ qname: '', rtype: 'A', value: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add DNS record:', error);
    }
  };

  const handleDeleteRecord = async (qname: string, rtype: string, value: string) => {
    if (!confirm(`Are you sure you want to delete the ${rtype} record for "${qname}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/admin/dns/custom/${qname}/${rtype}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(`${localStorage.getItem('user_email')}:${localStorage.getItem('session_key')}`)}`,
          'Content-Type': 'text/plain'
        },
        body: value
      });

      if (response.ok) {
        await fetchDNSData();
      }
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
    }
  };

  const handleUpdateDNS = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('force', '1');
      
      const response = await api.post('/dns/update', formData);
      
      if (response.success) {
        await fetchDNSData();
      }
    } catch (error) {
      console.error('Failed to update DNS:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredRecords = dnsRecords.filter(record => {
    const matchesSearch = record.qname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || record.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.zone]) {
      acc[record.zone] = [];
    }
    acc[record.zone].push(record);
    return acc;
  }, {} as Record<string, DNSRecord[]>);

  const getRecordTypeColor = (rtype: string) => {
    const colors = {
      'A': 'bg-blue-100 text-blue-800',
      'AAAA': 'bg-purple-100 text-purple-800',
      'CNAME': 'bg-green-100 text-green-800',
      'TXT': 'bg-yellow-100 text-yellow-800',
      'MX': 'bg-red-100 text-red-800',
      'SRV': 'bg-indigo-100 text-indigo-800',
      'NS': 'bg-orange-100 text-orange-800',
      'PTR': 'bg-gray-100 text-gray-800'
    };
    return colors[rtype as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Custom DNS</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">Custom DNS</h1>
          <p className="text-slate-600 mt-1">Manage custom DNS records for your domains</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleUpdateDNS}
            disabled={updating}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
            <span>Update DNS</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">{dnsRecords.length}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">DNS Zones</p>
              <p className="text-2xl font-bold text-green-600">{zones.length}</p>
            </div>
            <Settings className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Record Types</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(dnsRecords.map(r => r.rtype)).size}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Add DNS Record</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name/Subdomain
                </label>
                <input
                  type="text"
                  value={newRecord.qname}
                  onChange={(e) => setNewRecord({ ...newRecord, qname: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="subdomain.example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Record Type
                </label>
                <select
                  value={newRecord.rtype}
                  onChange={(e) => setNewRecord({ ...newRecord, rtype: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {recordTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newRecord.value}
                  onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="192.168.1.1 or example.com"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add Record
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
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Record Type Examples:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>A:</strong> Points to IPv4 address (192.168.1.1)</li>
              <li>• <strong>AAAA:</strong> Points to IPv6 address</li>
              <li>• <strong>CNAME:</strong> Points to another domain name</li>
              <li>• <strong>TXT:</strong> Text record for verification or SPF</li>
              <li>• <strong>MX:</strong> Mail exchange record (10 mail.example.com)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search records..."
            />
          </div>
          
          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DNS Records by Zone */}
      <div className="space-y-6">
        {Object.entries(groupedRecords).map(([zone, records]) => (
          <div key={zone} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-slate-600" />
                  {zone || 'Other Records'}
                </h3>
                <span className="text-sm text-slate-600">
                  {records.length} records
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {records.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{record.qname}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(record.rtype)}`}>
                          {record.rtype}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-sm text-slate-600 truncate block">{record.value}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.qname, record.rtype, record.value)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        
        {Object.keys(groupedRecords).length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No DNS records found</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              Add Your First Record
            </button>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Custom DNS Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Custom DNS records override automatic records for the same name and type</li>
              <li>• Changes may take up to 24 hours to propagate across the internet</li>
              <li>• Use "Update DNS" to regenerate zone files after making changes</li>
              <li>• Be careful when modifying MX and NS records as they affect mail delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}