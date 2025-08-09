import { useState, useEffect } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  Settings,
  Clock,
  Database,
  Calendar,
  Info
} from 'lucide-react';
import { api } from '../utils/api';

interface BackupConfig {
  target: string;
  target_user: string;
  target_pass: string;
  min_age: string;
}

interface BackupStatus {
  can_backup: boolean;
  backups: Array<{
    date: string;
    type: string;
    size: string;
    status: string;
  }>;
  error?: string;
  next_backup?: string;
}

export default function SystemBackupPage() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [backupConfig, setBackupConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configForm, setConfigForm] = useState({
    target: '',
    target_user: '',
    target_pass: '',
    min_age: '3'
  });

  useEffect(() => {
    fetchBackupData();
  }, []);

  const fetchBackupData = async () => {
    try {
      const [statusResponse, configResponse] = await Promise.all([
        api.get('/system/backup/status'),
        api.get('/system/backup/config')
      ]);

      if (statusResponse.success) {
        setBackupStatus(statusResponse.data as BackupStatus);
      }

      if (configResponse.success) {
        const config = configResponse.data as BackupConfig;
        setBackupConfig(config);
        setConfigForm({
          target: config.target || '',
          target_user: config.target_user || '',
          target_pass: config.target_pass || '',
          min_age: config.min_age || '3'
        });
      }
    } catch (error) {
      console.error('Failed to fetch backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('target', configForm.target);
      formData.append('target_user', configForm.target_user);
      formData.append('target_pass', configForm.target_pass);
      formData.append('min_age', configForm.min_age);

      const response = await api.post('/system/backup/config', formData);

      if (response.success) {
        await fetchBackupData();
        setShowConfigForm(false);
      }
    } catch (error) {
      console.error('Failed to save backup config:', error);
    } finally {
      setSaving(false);
    }
  };

  const getBackupStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'ok':
      case 'complete':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'ok':
      case 'complete':
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
      case 'partial':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
      case 'failed':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">System Backup</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">System Backup</h1>
          <p className="text-slate-600 mt-1">Configure and monitor automated backups</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBackupData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowConfigForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Settings className="w-5 h-5" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Backup Status</p>
              <p className={`text-xl font-bold mt-1 ${
                backupStatus?.can_backup ? 'text-green-600' : 'text-red-600'
              }`}>
                {backupStatus?.can_backup ? 'Configured' : 'Not Configured'}
              </p>
            </div>
            {backupStatus?.can_backup ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Backups</p>
              <p className="text-2xl font-bold text-blue-600">
                {backupStatus?.backups?.length || 0}
              </p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Next Backup</p>
              <p className="text-lg font-medium text-slate-900">
                {backupStatus?.next_backup || 'Not scheduled'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {showConfigForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Backup Configuration</h2>
            <button
              onClick={() => setShowConfigForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Backup Target
                </label>
                <input
                  type="text"
                  value={configForm.target}
                  onChange={(e) => setConfigForm({ ...configForm, target: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="s3://bucket-name or rsync://user@host/path"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Supported: S3, rsync, local file path
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username (if required)
                </label>
                <input
                  type="text"
                  value={configForm.target_user}
                  onChange={(e) => setConfigForm({ ...configForm, target_user: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Username or access key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password/Secret (if required)
                </label>
                <input
                  type="password"
                  value={configForm.target_pass}
                  onChange={(e) => setConfigForm({ ...configForm, target_pass: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password or secret key"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Age (days)
                </label>
                <input
                  type="number"
                  value={configForm.min_age}
                  onChange={(e) => setConfigForm({ ...configForm, min_age: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                  min="0"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Keep backups for at least this many days
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfigForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Configuration */}
      {backupConfig && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Target</p>
              <p className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                {backupConfig.target || 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Minimum Age</p>
              <p className="text-sm text-slate-900">
                {backupConfig.min_age} days
              </p>
            </div>
            {backupConfig.target_user && (
              <div>
                <p className="text-sm font-medium text-slate-600">Username</p>
                <p className="text-sm text-slate-900">
                  {backupConfig.target_user}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {backupStatus?.error && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-medium text-red-900 mb-2">Backup Error</h3>
              <p className="text-sm text-red-800">{backupStatus.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Backup History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Backup History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {(backupStatus?.backups?.length ?? 0) > 0 ? backupStatus!.backups!.map((backup, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm font-medium text-slate-900">{backup?.date || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Database className="w-3 h-3 mr-1" />
                      {backup?.type || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {backup?.size || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(backup?.status || '')}`}>
                      {getBackupStatusIcon(backup?.status || '')}
                      <span className="ml-2">{backup?.status || 'Unknown'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No backups found</p>
                    {!backupStatus?.can_backup && (
                      <button
                        onClick={() => setShowConfigForm(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Configure Backups
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Backup Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Backups run automatically daily and include all mail data and settings</li>
              <li>• S3-compatible storage, rsync, and local paths are supported</li>
              <li>• Encrypted backups ensure your data remains secure during transfer and storage</li>
              <li>• Configure retention policies to automatically clean up old backups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}