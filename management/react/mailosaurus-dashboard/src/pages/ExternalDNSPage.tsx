import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  Plus, 
  Trash2,
  AlertCircle,
  Info,
  ExternalLink,
  Server,
  Download
} from 'lucide-react';
import { api } from '../utils/api';

interface SecondaryNameserver {
  hostnames: string[];
}

interface DNSRecommendations {
  [domain: string]: {
    [recordType: string]: string[];
  };
}

export default function ExternalDNSPage() {
  const [dnsRecommendations, setDnsRecommendations] = useState<DNSRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameserver, setNewNameserver] = useState('');
  const [nameservers, setNameservers] = useState<string[]>([]);

  useEffect(() => {
    fetchExternalDNSData();
  }, []);

  const fetchExternalDNSData = async () => {
    try {
      const [nsResponse, dumpResponse] = await Promise.all([
        api.get('/dns/secondary-nameserver'),
        api.get('/dns/dump')
      ]);

      if (nsResponse.success) {
        const data = nsResponse.data as SecondaryNameserver;
        setNameservers(data.hostnames || []);
      }

      if (dumpResponse.success) {
        setDnsRecommendations(dumpResponse.data as DNSRecommendations);
      }
    } catch (error) {
      console.error('Failed to fetch external DNS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNameservers = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('hostnames', nameservers.join(', '));

      const response = await api.post('/dns/secondary-nameserver', formData);

      if (response.success) {
        await fetchExternalDNSData();
      }
    } catch (error) {
      console.error('Failed to save nameservers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNameserver = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNameserver.trim() && !nameservers.includes(newNameserver.trim())) {
      setNameservers([...nameservers, newNameserver.trim()]);
      setNewNameserver('');
      setShowAddForm(false);
    }
  };

  const handleRemoveNameserver = (hostname: string) => {
    setNameservers(nameservers.filter(ns => ns !== hostname));
  };

  const exportDNSZone = async (domain: string) => {
    try {
      const response = await api.get(`/dns/zonefile/${domain}`);
      if (response.success) {
        const blob = new Blob([response.data as string], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${domain}.zone`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export DNS zone:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">External DNS</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">External DNS</h1>
          <p className="text-slate-600 mt-1">Configure external DNS providers and secondary nameservers</p>
        </div>
        <button
          onClick={fetchExternalDNSData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Secondary Nameservers */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Secondary Nameservers</h2>
            <p className="text-slate-600 mt-1">Configure additional nameservers for your domains</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Nameserver</span>
          </button>
        </div>

        {/* Add Nameserver Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <form onSubmit={handleAddNameserver} className="flex items-center space-x-3">
              <input
                type="text"
                value={newNameserver}
                onChange={(e) => setNewNameserver(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ns2.example.com"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Current Nameservers */}
        <div className="space-y-3">
          {nameservers.map((hostname, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <Server className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">{hostname}</span>
              </div>
              <button
                onClick={() => handleRemoveNameserver(hostname)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {nameservers.length === 0 && (
            <div className="text-center py-8">
              <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No secondary nameservers configured</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveNameservers}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* DNS Recommendations */}
      {dnsRecommendations && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recommended DNS Records</h2>
            <p className="text-slate-600 mt-1">Use these records when configuring external DNS providers</p>
          </div>
          
          <div className="divide-y divide-slate-200">
            {Object.entries(dnsRecommendations).map(([domain, records]) => (
              <div key={domain} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-900">{domain}</h3>
                  </div>
                  <button
                    onClick={() => exportDNSZone(domain)}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Zone</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(records).map(([recordType, values]) => (
                    <div key={recordType}>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">{recordType} Records</h4>
                      <div className="space-y-2">
                        {values.map((value, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <code className="text-sm text-slate-900 font-mono">{value}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-medium text-amber-900 mb-2">Using External DNS</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>1. Configure your domain registrar to use external nameservers</li>
                <li>2. Add the recommended DNS records to your external provider</li>
                <li>3. Configure secondary nameservers for redundancy</li>
                <li>4. Test DNS resolution before switching over</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Secondary Nameservers</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Provide redundancy if primary nameserver fails</li>
                <li>• Should be geographically distributed</li>
                <li>• Must support zone transfers or manual updates</li>
                <li>• Popular providers: Cloudflare, AWS Route 53, etc.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular DNS Providers */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Popular DNS Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">Cloudflare</h3>
                <p className="text-sm text-slate-600">Free DNS with global anycast network</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">AWS Route 53</h3>
                <p className="text-sm text-slate-600">Scalable DNS with health checks</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">Google Cloud DNS</h3>
                <p className="text-sm text-slate-600">High-performance managed DNS</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}