import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ExternalLink,
  Shield,
  Info,
  Upload,
  FileText,
  Settings
} from 'lucide-react';
import { api } from '../utils/api';

interface WebDomain {
  domain: string;
  root: string;
  ssl_certificate: [string, string];
  // Additional properties that might be in the API response
  [key: string]: any;
}

export default function WebPage() {
  const [webDomains, setWebDomains] = useState<WebDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWebDomains();
  }, []);

  const fetchWebDomains = async () => {
    try {
      const response = await api.get('/web/domains');
      if (response.success) {
        setWebDomains(response.data as WebDomain[]);
      }
    } catch (error) {
      console.error('Failed to fetch web domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeb = async () => {
    setUpdating(true);
    try {
      const response = await api.post('/web/update');
      if (response.success) {
        await fetchWebDomains();
      }
    } catch (error) {
      console.error('Failed to update web configuration:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getSSLStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSSLStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
      case 'invalid':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Web</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">Web</h1>
          <p className="text-slate-600 mt-1">Manage website hosting and SSL certificates</p>
        </div>
        <button
          onClick={handleUpdateWeb}
          disabled={updating}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
          <span>Update Web Config</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Hosted Domains</p>
              <p className="text-2xl font-bold text-blue-600">{webDomains.length}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">SSL Secured</p>
              <p className="text-2xl font-bold text-green-600">
                {webDomains.filter(d => d.ssl_certificate[0].toLowerCase() === 'ok').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">SSL Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {webDomains.filter(d => d.ssl_certificate[0].toLowerCase() !== 'ok').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Web Domains */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Hosted Domains</h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {webDomains.map((domain, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-slate-600" />
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{domain.domain}</h3>
                    <p className="text-sm text-slate-600">Document root: {domain.root}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit</span>
                  </a>
                </div>
              </div>

              {/* SSL Certificate Status */}
              <div className={`p-4 rounded-lg border ${getSSLStatusColor(domain.ssl_certificate[0])}`}>
                <div className="flex items-start space-x-3">
                  {getSSLStatusIcon(domain.ssl_certificate[0])}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">SSL Certificate</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSSLStatusColor(domain.ssl_certificate[0])}`}>
                        {domain.ssl_certificate[0]}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{domain.ssl_certificate[1]}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {webDomains.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No web domains configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Static Website Hosting</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload HTML, CSS, and JavaScript files to serve static websites</li>
                <li>• Files should be placed in the document root directory</li>
                <li>• SSL certificates are automatically provisioned and renewed</li>
                <li>• Custom domains can be added through DNS configuration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-green-900 mb-2">File Management</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Use SFTP or rsync to upload website files</li>
                <li>• Set proper file permissions (644 for files, 755 for directories)</li>
                <li>• Create an index.html file for the default page</li>
                <li>• Use subdirectories to organize your website structure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Web Server Configuration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Web Server Configuration</h2>
            <p className="text-slate-600 mt-1">Nginx configuration and server settings</p>
          </div>
          <Settings className="w-6 h-6 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Default Configuration</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Nginx web server with automatic HTTPS redirect</li>
                <li>• Gzip compression enabled for better performance</li>
                <li>• Security headers configured by default</li>
                <li>• PHP support available for dynamic content</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">File Locations</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Document root: /home/user-data/www/</li>
                <li>• Access logs: /var/log/nginx/access.log</li>
                <li>• Error logs: /var/log/nginx/error.log</li>
                <li>• Configuration: /etc/nginx/conf.d/</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200">
            <Upload className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Upload Files</p>
              <p className="text-sm text-blue-700">Use SFTP to upload website content</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">SSL Status</p>
              <p className="text-sm text-green-700">Check certificate status</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-violet-100 transition-all duration-200">
            <FileText className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">View Logs</p>
              <p className="text-sm text-purple-700">Check access and error logs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}