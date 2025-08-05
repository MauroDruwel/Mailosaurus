import { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  Upload,
  Globe
} from 'lucide-react';
import { api } from '../utils/api';

interface SSLDomain {
  domain: string;
  status: string;
  text: string;
}

interface SSLStatus {
  can_provision: string[];
  status: SSLDomain[];
}

export default function SSLPage() {
  const [sslData, setSSLData] = useState<SSLStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [showCSRForm, setShowCSRForm] = useState(false);
  const [installForm, setInstallForm] = useState({
    domain: '',
    cert: '',
    chain: ''
  });
  const [csrForm, setCSRForm] = useState({
    domain: '',
    countrycode: 'US'
  });

  useEffect(() => {
    fetchSSLStatus();
  }, []);

  const fetchSSLStatus = async () => {
    try {
      const response = await api.get('/ssl/status');
      if (response.success) {
        setSSLData(response.data as SSLStatus);
      }
    } catch (error) {
      console.error('Failed to fetch SSL status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionCertificates = async () => {
    setProvisioning(true);
    try {
      const response = await api.post('/ssl/provision');
      if (response.success) {
        // Refresh status after provisioning
        await fetchSSLStatus();
      }
    } catch (error) {
      console.error('Failed to provision certificates:', error);
    } finally {
      setProvisioning(false);
    }
  };

  const handleInstallCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('domain', installForm.domain);
      formData.append('cert', installForm.cert);
      formData.append('chain', installForm.chain);

      const response = await api.post('/ssl/install', formData);

      if (response.success) {
        await fetchSSLStatus();
        setInstallForm({ domain: '', cert: '', chain: '' });
        setShowInstallForm(false);
      }
    } catch (error) {
      console.error('Failed to install certificate:', error);
    }
  };

  const handleGenerateCSR = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('countrycode', csrForm.countrycode);

      const response = await api.post(`/ssl/csr/${csrForm.domain}`, formData);

      if (response.success) {
        // Create and download the CSR file
        const blob = new Blob([response.data as string], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${csrForm.domain}.csr`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setCSRForm({ domain: '', countrycode: 'US' });
        setShowCSRForm(false);
      }
    } catch (error) {
      console.error('Failed to generate CSR:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('OK')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.includes('ERROR') || status.includes('INVALID')) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes('OK')) return 'border-green-200 bg-green-50 text-green-800';
    if (status.includes('ERROR') || status.includes('INVALID')) return 'border-red-200 bg-red-50 text-red-800';
    return 'border-yellow-200 bg-yellow-50 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">SSL Certificates</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">SSL Certificates</h1>
          <p className="text-slate-600 mt-1">Manage TLS/SSL certificates for secure connections</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSSLStatus}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleProvisionCertificates}
            disabled={provisioning || !sslData?.can_provision.length}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            <span>Auto-Provision</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Valid Certificates</p>
              <p className="text-2xl font-bold text-green-600">
                {sslData?.status.filter(d => d.status.includes('OK')).length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Issues Found</p>
              <p className="text-2xl font-bold text-red-600">
                {sslData?.status.filter(d => d.status.includes('ERROR') || d.status.includes('INVALID')).length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Auto-Provision Ready</p>
              <p className="text-2xl font-bold text-blue-600">
                {sslData?.can_provision.length || 0}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Auto-Provision Section */}
      {sslData && sslData.can_provision.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Auto-Provision Available</h2>
            <button
              onClick={handleProvisionCertificates}
              disabled={provisioning}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {provisioning ? 'Provisioning...' : 'Provision All'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sslData.can_provision.map((domain, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">{domain}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Certificate Management */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Manual Certificate Management</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCSRForm(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Generate CSR</span>
            </button>
            <button
              onClick={() => setShowInstallForm(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Install Certificate</span>
            </button>
          </div>
        </div>

        {/* Install Certificate Form */}
        {showInstallForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-900">Install Certificate</h3>
              <button
                onClick={() => setShowInstallForm(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInstallCertificate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Domain</label>
                <input
                  type="text"
                  value={installForm.domain}
                  onChange={(e) => setInstallForm({ ...installForm, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Certificate (PEM format)</label>
                <textarea
                  value={installForm.cert}
                  onChange={(e) => setInstallForm({ ...installForm, cert: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
                  placeholder="-----BEGIN CERTIFICATE-----"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Certificate Chain (PEM format)</label>
                <textarea
                  value={installForm.chain}
                  onChange={(e) => setInstallForm({ ...installForm, chain: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
                  placeholder="-----BEGIN CERTIFICATE-----"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  Install Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowInstallForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Generate CSR Form */}
        {showCSRForm && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-purple-900">Generate Certificate Signing Request</h3>
              <button
                onClick={() => setShowCSRForm(false)}
                className="text-purple-600 hover:text-purple-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerateCSR} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-2">Domain</label>
                  <input
                    type="text"
                    value={csrForm.domain}
                    onChange={(e) => setCSRForm({ ...csrForm, domain: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-2">Country Code</label>
                  <input
                    type="text"
                    value={csrForm.countrycode}
                    onChange={(e) => setCSRForm({ ...csrForm, countrycode: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="US"
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                >
                  Generate & Download CSR
                </button>
                <button
                  type="button"
                  onClick={() => setShowCSRForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Domain SSL Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Domain Certificate Status</h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {sslData?.status.map((domain, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{domain.domain}</p>
                    <p className="text-sm text-slate-600">{domain.text}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(domain.status)}`}>
                    {getStatusIcon(domain.status)}
                    <span className="ml-2">{domain.status}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {!sslData?.status.length && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No domains configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">SSL Certificate Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Let's Encrypt certificates are automatically renewed before expiration</li>
              <li>• Auto-provision creates free SSL certificates for your domains</li>
              <li>• Manual installation allows you to use certificates from other providers</li>
              <li>• CSR generation helps you request certificates from commercial providers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}