import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Server,
  Shield,
  Mail,
  Globe,
  Database,
  Monitor,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

interface StatusItem {
  type: 'heading' | 'ok' | 'error' | 'warning';
  text: string;
  extra: Array<{
    text: string;
    monospace?: boolean;
  }>;
}

export default function SystemStatusPage() {
  const [statusData, setStatusData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await api.post('/system/status');
      if (response.success && Array.isArray(response.data)) {
        setStatusData(response.data);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'heading':
        return <Server className="w-5 h-5 text-blue-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'ok':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'heading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getStatusTextColor = (type: string) => {
    switch (type) {
      case 'ok':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'heading':
        return 'text-blue-800';
      default:
        return 'text-slate-800';
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const getOverallStatus = () => {
    const hasError = statusData.some(item => item.type === 'error');
    const hasWarning = statusData.some(item => item.type === 'warning');
    
    if (hasError) return { status: 'error', text: 'Issues Detected', color: 'from-red-500 to-pink-600' };
    if (hasWarning) return { status: 'warning', text: 'Warnings Present', color: 'from-yellow-500 to-orange-600' };
    return { status: 'ok', text: 'All Systems Operational', color: 'from-green-500 to-emerald-600' };
  };

  const overall = getOverallStatus();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">System Status</h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-slate-900">System Status</h1>
          <p className="text-slate-600 mt-1">Monitor your mail server health and performance</p>
        </div>
        <button
          onClick={fetchSystemStatus}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Overall Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${overall.color} rounded-xl flex items-center justify-center`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Overall Status</h2>
              <p className={`text-lg font-medium ${getStatusTextColor(overall.status)}`}>
                {overall.text}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Last checked</p>
            <p className="text-sm font-medium text-slate-900">
              {lastChecked ? lastChecked.toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">OK Checks</p>
              <p className="text-2xl font-bold text-green-600">
                {statusData.filter(item => item.type === 'ok').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statusData.filter(item => item.type === 'warning').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {statusData.filter(item => item.type === 'error').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Sections</p>
              <p className="text-2xl font-bold text-blue-600">
                {statusData.filter(item => item.type === 'heading').length}
              </p>
            </div>
            <Monitor className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Detailed System Checks</h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {statusData.map((item, index) => (
            <div key={index} className={`p-4 ${getStatusColor(item.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(item.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${getStatusTextColor(item.type)}`}>
                        {item.text}
                      </p>
                      {item.type === 'heading' && item.extra.length > 0 && (
                        <button
                          onClick={() => toggleSection(index)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          {expandedSections.has(index) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Show extra details if expanded or not a heading */}
                    {(item.type !== 'heading' || expandedSections.has(index)) && item.extra.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.extra.map((extra, extraIndex) => (
                          <p
                            key={extraIndex}
                            className={`text-sm text-slate-600 ${
                              extra.monospace ? 'font-mono bg-slate-100 px-2 py-1 rounded text-xs' : ''
                            }`}
                          >
                            {extra.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {statusData.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No status data available</p>
              <button
                onClick={fetchSystemStatus}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Run System Check
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">Mail Services</h3>
          </div>
          <p className="text-sm text-slate-600">SMTP, IMAP, and mail delivery components</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-slate-900">DNS Services</h3>
          </div>
          <p className="text-sm text-slate-600">Domain name resolution and DNS records</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-900">Security</h3>
          </div>
          <p className="text-sm text-slate-600">SSL certificates, firewall, and protection</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">Web Services</h3>
          </div>
          <p className="text-sm text-slate-600">HTTP server and web hosting components</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-cyan-500" />
            <h3 className="text-lg font-semibold text-slate-900">Storage</h3>
          </div>
          <p className="text-sm text-slate-600">Disk usage, backup, and storage health</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Monitor className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">System</h3>
          </div>
          <p className="text-sm text-slate-600">OS updates, processes, and system health</p>
        </div>
      </div>
    </div>
  );
}