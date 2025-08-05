import { useState, useEffect } from 'react';
import { 
  Smartphone,
  Monitor,
  Info,
  Copy,
  CheckCircle,
  Globe,
  Lock,
  Server
} from 'lucide-react';
import { api } from '../utils/api';

interface MailSettings {
  hostname: string;
  domains: string[];
}

export default function MailGuidePage() {
  const [mailSettings, setMailSettings] = useState<MailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchMailSettings();
  }, []);

  const fetchMailSettings = async () => {
    try {
      // Get hostname and domains for mail configuration
      const domainsResponse = await api.get('/mail/domains');
      
      if (domainsResponse.success) {
        const domains = (domainsResponse.data as string).split('\n').filter(d => d.trim());
        setMailSettings({
          hostname: domains[0] || 'mail.example.com', // Use first domain as hostname
          domains
        });
      }
    } catch (error) {
      console.error('Failed to fetch mail settings:', error);
      // Fallback settings
      setMailSettings({
        hostname: 'mail.example.com',
        domains: ['example.com']
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const mailClients = [
    {
      name: 'Outlook',
      icon: Monitor,
      platforms: ['Windows', 'macOS'],
      settings: {
        incoming: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '993',
          security: 'SSL/TLS',
          protocol: 'IMAP'
        },
        outgoing: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '587',
          security: 'STARTTLS',
          auth: 'Required'
        }
      }
    },
    {
      name: 'Apple Mail',
      icon: Monitor,
      platforms: ['macOS', 'iOS'],
      settings: {
        incoming: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '993',
          security: 'SSL/TLS',
          protocol: 'IMAP'
        },
        outgoing: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '587',
          security: 'STARTTLS',
          auth: 'Required'
        }
      }
    },
    {
      name: 'Thunderbird',
      icon: Monitor,
      platforms: ['Windows', 'macOS', 'Linux'],
      settings: {
        incoming: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '993',
          security: 'SSL/TLS',
          protocol: 'IMAP'
        },
        outgoing: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '587',
          security: 'STARTTLS',
          auth: 'Required'
        }
      }
    },
    {
      name: 'Mobile Apps',
      icon: Smartphone,
      platforms: ['iOS', 'Android'],
      settings: {
        incoming: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '993',
          security: 'SSL/TLS',
          protocol: 'IMAP'
        },
        outgoing: {
          server: mailSettings?.hostname || 'mail.example.com',
          port: '587',
          security: 'STARTTLS',
          auth: 'Required'
        }
      }
    }
  ];

  const ConfigField = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-600 font-mono">{value}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value, field)}
        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        title="Copy to clipboard"
      >
        {copiedField === field ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Mail Guide</h1>
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
          <h1 className="text-3xl font-bold text-slate-900">Mail Guide</h1>
          <p className="text-slate-600 mt-1">Configure your email clients to connect to your mail server</p>
        </div>
      </div>

      {/* Server Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <Server className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Server Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-4">Incoming Mail (IMAP)</h3>
            <div className="space-y-3">
              <ConfigField 
                label="Server" 
                value={mailSettings?.hostname || 'mail.example.com'} 
                field="imap-server" 
              />
              <ConfigField label="Port" value="993" field="imap-port" />
              <ConfigField label="Security" value="SSL/TLS" field="imap-security" />
              <ConfigField label="Authentication" value="Normal password" field="imap-auth" />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-slate-900 mb-4">Outgoing Mail (SMTP)</h3>
            <div className="space-y-3">
              <ConfigField 
                label="Server" 
                value={mailSettings?.hostname || 'mail.example.com'} 
                field="smtp-server" 
              />
              <ConfigField label="Port" value="587" field="smtp-port" />
              <ConfigField label="Security" value="STARTTLS" field="smtp-security" />
              <ConfigField label="Authentication" value="Normal password" field="smtp-auth" />
            </div>
          </div>
        </div>
      </div>

      {/* Client Configuration */}
      <div className="space-y-6">
        {mailClients.map((client, index) => {
          const Icon = client.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <Icon className="w-6 h-6 text-slate-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                  <p className="text-sm text-slate-600">{client.platforms.join(', ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Incoming Server</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Protocol:</span>
                      <span className="text-sm font-medium">{client.settings.incoming.protocol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Server:</span>
                      <span className="text-sm font-medium font-mono">{client.settings.incoming.server}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Port:</span>
                      <span className="text-sm font-medium">{client.settings.incoming.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Security:</span>
                      <span className="text-sm font-medium">{client.settings.incoming.security}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Outgoing Server</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Protocol:</span>
                      <span className="text-sm font-medium">SMTP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Server:</span>
                      <span className="text-sm font-medium font-mono">{client.settings.outgoing.server}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Port:</span>
                      <span className="text-sm font-medium">{client.settings.outgoing.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Security:</span>
                      <span className="text-sm font-medium">{client.settings.outgoing.security}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webmail Access */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-slate-900">Webmail Access</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600">
            Access your email through the web browser without configuring a mail client.
          </p>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">Webmail URL</p>
                <p className="text-sm text-green-700 font-mono">
                  https://{mailSettings?.hostname || 'mail.example.com'}/mail/
                </p>
              </div>
              <button
                onClick={() => window.open(`https://${mailSettings?.hostname || 'mail.example.com'}/mail/`, '_blank')}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Open Webmail</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Security & Authentication</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Always use your full email address as the username</li>
              <li>• Use the same password you use to log into this control panel</li>
              <li>• All connections are encrypted with SSL/TLS</li>
              <li>• IMAP is recommended over POP3 for multi-device access</li>
              <li>• Enable two-factor authentication for additional security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-amber-600 mt-1" />
          <div>
            <h3 className="font-medium text-amber-900 mb-2">Troubleshooting Tips</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• If you can't connect, check that your firewall allows the required ports</li>
              <li>• Make sure you're using the correct server hostname</li>
              <li>• Verify that your email account exists and is active</li>
              <li>• Some ISPs block port 25; use port 587 for SMTP instead</li>
              <li>• Contact your administrator if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}