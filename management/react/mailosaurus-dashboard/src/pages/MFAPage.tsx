import { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Plus, 
  Trash2,
  Key,
  Smartphone,
  QrCode,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../utils/api';

interface MFADevice {
  id: string;
  type: 'totp';
  label: string;
  created: string;
}

interface MFAStatus {
  enabled_mfa: MFADevice[];
  new_mfa?: {
    totp: {
      secret: string;
      qr_code_url: string;
      provisioning_uri: string;
    };
  };
}

export default function MFAPage() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [setupForm, setSetupForm] = useState({
    label: '',
    token: '',
    secret: ''
  });
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const response = await api.post('/mfa/status');
      if (response.success) {
        setMfaStatus(response.data as MFAStatus);
      }
    } catch (error) {
      console.error('Failed to fetch MFA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('secret', setupForm.secret);
      formData.append('token', setupForm.token);
      formData.append('label', setupForm.label);

      const response = await api.post('/mfa/totp/enable', formData);

      if (response.success) {
        await fetchMFAStatus();
        setSetupForm({ label: '', token: '', secret: '' });
        setShowSetupForm(false);
      }
    } catch (error) {
      console.error('Failed to enable MFA:', error);
    }
  };

  const handleDisableMFA = async (mfaId: string, label: string) => {
    if (!confirm(`Are you sure you want to disable MFA for "${label}"?`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('mfa-id', mfaId);

      const response = await api.post('/mfa/disable', formData);

      if (response.success) {
        await fetchMFAStatus();
      }
    } catch (error) {
      console.error('Failed to disable MFA:', error);
    }
  };

  const handleStartSetup = () => {
    if (mfaStatus?.new_mfa?.totp) {
      setSetupForm({
        ...setupForm,
        secret: mfaStatus.new_mfa.totp.secret
      });
      setShowSetupForm(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Multi-Factor Authentication</h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-slate-900">Multi-Factor Authentication</h1>
          <p className="text-slate-600 mt-1">Secure your account with an additional layer of protection</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMFAStatus}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {mfaStatus?.new_mfa && (
            <button
              onClick={handleStartSetup}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Device</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">MFA Status</p>
              <p className={`text-xl font-bold mt-1 ${
                mfaStatus?.enabled_mfa?.length ? 'text-green-600' : 'text-red-600'
              }`}>
                {mfaStatus?.enabled_mfa?.length ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            {mfaStatus?.enabled_mfa?.length ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Devices</p>
              <p className="text-2xl font-bold text-blue-600">
                {mfaStatus?.enabled_mfa?.length || 0}
              </p>
            </div>
            <Smartphone className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Setup Form */}
      {showSetupForm && mfaStatus?.new_mfa?.totp && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Set Up Multi-Factor Authentication</h2>
            <button
              onClick={() => setShowSetupForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  Step 1: Scan QR Code
                </h3>
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  {mfaStatus.new_mfa.totp.qr_code_url ? (
                    <img 
                      src={mfaStatus.new_mfa.totp.qr_code_url} 
                      alt="QR Code for MFA setup"
                      className="mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <p className="text-sm text-slate-600">
                    Use your authenticator app to scan this QR code
                  </p>
                </div>
              </div>

              {/* Manual Setup */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Manual Setup</h4>
                <p className="text-sm text-slate-600 mb-2">
                  If you can't scan the QR code, enter this secret manually:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={mfaStatus.new_mfa.totp.secret}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 text-slate-600 hover:text-slate-800"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Step 2: Verify Setup
              </h3>
              
              <form onSubmit={handleEnableMFA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Device Label
                  </label>
                  <input
                    type="text"
                    value={setupForm.label}
                    onChange={(e) => setSetupForm({ ...setupForm, label: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="My Phone"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={setupForm.token}
                    onChange={(e) => setSetupForm({ ...setupForm, token: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Enable MFA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSetupForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Active MFA Devices */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Active MFA Devices</h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {mfaStatus?.enabled_mfa?.map((device, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{device.label}</h3>
                    <p className="text-sm text-slate-600">
                      TOTP • Added {new Date(device.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                  <button
                    onClick={() => handleDisableMFA(device.id, device.label)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {!mfaStatus?.enabled_mfa?.length && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No MFA devices configured</p>
              {mfaStatus?.new_mfa && (
                <button
                  onClick={handleStartSetup}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  Set Up MFA
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Apps */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recommended Authenticator Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg">
            <h3 className="font-medium text-slate-900">Google Authenticator</h3>
            <p className="text-sm text-slate-600 mt-1">Free app for iOS and Android</p>
          </div>
          
          <div className="p-4 border border-slate-200 rounded-lg">
            <h3 className="font-medium text-slate-900">Authy</h3>
            <p className="text-sm text-slate-600 mt-1">Multi-device sync and backup</p>
          </div>
          
          <div className="p-4 border border-slate-200 rounded-lg">
            <h3 className="font-medium text-slate-900">1Password</h3>
            <p className="text-sm text-slate-600 mt-1">Integrated with password manager</p>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-amber-600 mt-1" />
          <div>
            <h3 className="font-medium text-amber-900 mb-2">Important Security Notes</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Keep backup codes in a safe place in case you lose access to your device</li>
              <li>• Don't share your QR code or secret key with anyone</li>
              <li>• Consider setting up multiple devices for redundancy</li>
              <li>• If you lose your device, disable MFA immediately and set up a new one</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}