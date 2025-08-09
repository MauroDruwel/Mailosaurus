import { useState } from 'react';
import { 
  Mail, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  HardDrive,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  BarChart3,
  Download
} from 'lucide-react';

interface MailStats {
  sent: number;
  received: number;
  users: string[];
  timespan: string;
}

interface BackupStatus {
  status: 'success' | 'warning' | 'error';
  lastBackup: string;
  size: string;
  nextBackup: string;
}

interface SSLStatus {
  certificates: number;
  renewed: number;
  expiring: number;
  status: 'success' | 'warning' | 'error';
}

interface SystemStatus {
  services: { name: string; status: 'running' | 'stopped' }[];
  issues: string[];
  warnings: string[];
}

// Sample data - in real implementation this would come from API
const sampleMailStats: MailStats = {
  sent: 247,
  received: 186,
  users: ['admin@example.com', 'user1@example.com', 'user2@example.com'],
  timespan: 'week'
};

const sampleBackupStatus: BackupStatus = {
  status: 'success',
  lastBackup: '2024-01-15 03:00:00',
  size: '2.3 GB',
  nextBackup: '2024-01-16 03:00:00'
};

const sampleSSLStatus: SSLStatus = {
  certificates: 5,
  renewed: 2,
  expiring: 0,
  status: 'success'
};

const sampleSystemStatus: SystemStatus = {
  services: [
    { name: 'Postfix', status: 'running' },
    { name: 'Dovecot', status: 'running' },
    { name: 'Nginx', status: 'running' },
    { name: 'DNS', status: 'running' }
  ],
  issues: [],
  warnings: ['Disk usage is at 65%']
};

export default function EmailReportsPage() {
  const [selectedReport, setSelectedReport] = useState<'mail' | 'backup' | 'ssl' | 'system'>('mail');

  const StatusBadge = ({ status, text }: { status: 'success' | 'warning' | 'error'; text: string }) => {
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      error: AlertCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${colors[status]}`}>
        <Icon size={14} />
        {text}
      </span>
    );
  };

  const ReportCard = ({ 
    title, 
    children, 
    icon: Icon, 
    status 
  }: { 
    title: string; 
    children: React.ReactNode; 
    icon: any; 
    status?: 'success' | 'warning' | 'error';
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            status === 'success' ? 'bg-green-100 text-green-600' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            status === 'error' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {status && <StatusBadge status={status} text={status} />}
      </div>
      {children}
    </div>
  );

  const MailReport = () => (
    <ReportCard title="Weekly Mail Report" icon={Mail}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-800">Sent</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{sampleMailStats.sent}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-800">Received</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{sampleMailStats.received}</div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-slate-600" />
            <span className="font-medium text-slate-700">Active Users</span>
          </div>
          <div className="space-y-2">
            {sampleMailStats.users.map((user, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-700">{user}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-purple-600" />
            <span className="font-medium text-purple-800">Activity Summary</span>
          </div>
          <p className="text-sm text-purple-700">
            Mail activity for the past {sampleMailStats.timespan} shows healthy usage patterns 
            with {sampleMailStats.sent + sampleMailStats.received} total messages processed.
          </p>
        </div>
      </div>
    </ReportCard>
  );

  const BackupReport = () => (
    <ReportCard title="Backup Status" icon={HardDrive} status={sampleBackupStatus.status}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">Last Backup</div>
            <div className="text-lg font-semibold text-slate-900">{sampleBackupStatus.lastBackup}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">Backup Size</div>
            <div className="text-lg font-semibold text-slate-900">{sampleBackupStatus.size}</div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-slate-600" />
            <span className="font-medium text-slate-700">Next Scheduled Backup</span>
          </div>
          <div className="text-sm text-slate-600">{sampleBackupStatus.nextBackup}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="font-medium text-green-800">Backup Completed Successfully</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All system data has been backed up successfully. No issues detected.
          </p>
        </div>
      </div>
    </ReportCard>
  );

  const SSLReport = () => (
    <ReportCard title="SSL Certificate Status" icon={Shield} status={sampleSSLStatus.status}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-xl font-bold text-blue-900">{sampleSSLStatus.certificates}</div>
            <div className="text-sm text-blue-700">Total Certificates</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-xl font-bold text-green-900">{sampleSSLStatus.renewed}</div>
            <div className="text-sm text-green-700">Renewed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <div className="text-xl font-bold text-yellow-900">{sampleSSLStatus.expiring}</div>
            <div className="text-sm text-yellow-700">Expiring Soon</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="font-medium text-green-800">All Certificates Valid</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            SSL certificate provisioning completed successfully. All domains are properly secured.
          </p>
        </div>
      </div>
    </ReportCard>
  );

  const SystemReport = () => (
    <ReportCard title="System Status" icon={Activity} status={sampleSystemStatus.warnings.length > 0 ? 'warning' : 'success'}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-slate-600" />
            <span className="font-medium text-slate-700">Services Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sampleSystemStatus.services.map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  service.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-slate-700">{service.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  service.status === 'running' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {sampleSystemStatus.warnings.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">Warnings</span>
            </div>
            <ul className="space-y-1">
              {sampleSystemStatus.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {sampleSystemStatus.issues.length === 0 && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium text-green-800">No Critical Issues</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              System status checks completed successfully.
            </p>
          </div>
        )}
      </div>
    </ReportCard>
  );

  const reports = [
    { id: 'mail' as const, name: 'Mail Reports', icon: Mail, component: MailReport },
    { id: 'backup' as const, name: 'Backup Status', icon: HardDrive, component: BackupReport },
    { id: 'ssl' as const, name: 'SSL Certificates', icon: Shield, component: SSLReport },
    { id: 'system' as const, name: 'System Status', icon: Activity, component: SystemReport },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Email Reports</h1>
            <p className="text-slate-600 mt-1">
              Preview and manage your daily email report templates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200">
              <Download size={16} />
              Export Sample
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Report Types</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {reports.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedReport(id)}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                selectedReport === id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      <div>
        {reports.find(r => r.id === selectedReport)?.component()}
      </div>

      {/* Email Template Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <Mail className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Email Reports</h3>
            <p className="text-blue-800 text-sm mb-3">
              These reports are automatically generated and sent to the administrator email address daily. 
              The styling shown above will be applied to make your reports more readable and professional.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Weekly mail usage reports (sent on Mondays)</li>
              <li>• Daily backup status notifications</li>
              <li>• SSL certificate provisioning results</li>
              <li>• System status change notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}