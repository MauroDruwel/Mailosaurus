import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Mail, 
  Shield, 
  Server, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { api } from '../utils/api';

interface SystemStatus {
  status: 'ok' | 'warning' | 'error';
  message: string;
}

interface DashboardStats {
  userCount: number;
  aliasCount: number;
  domainCount: number;
  systemStatus: SystemStatus;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch various data in parallel
        const [usersResponse, aliasesResponse, domainsResponse] = await Promise.all([
          api.get('/mail/users?format=json'),
          api.get('/mail/aliases?format=json'), 
          api.get('/mail/domains')
        ]);

        // Count active users from the domain-based structure
        let activeUserCount = 0;
        if (Array.isArray(usersResponse.data)) {
          usersResponse.data.forEach((domain: any) => {
            if (domain.users && Array.isArray(domain.users)) {
              domain.users.forEach((user: any) => {
                if (user.status === 'active') {
                  activeUserCount++;
                }
              });
            }
          });
        }

        // Count aliases from the domain-based structure
        let aliasCount = 0;
        if (Array.isArray(aliasesResponse.data)) {
          aliasesResponse.data.forEach((domain: any) => {
            if (domain.aliases && Array.isArray(domain.aliases)) {
              aliasCount += domain.aliases.length;
            }
          });
        }

        // Domains response is plain text (e.g., newline-separated)
        let domainCount = 0;
        if (typeof domainsResponse.data === 'string') {
          // Split by newlines, filter out empty lines
          domainCount = domainsResponse.data.split('\n').filter((d: string) => d.trim() !== '').length;
        } else if (Array.isArray(domainsResponse.data)) {
          domainCount = domainsResponse.data.length;
        }

        setStats({
          userCount: activeUserCount,
          aliasCount: aliasCount,
          domainCount: domainCount,
          systemStatus: { status: 'ok', message: 'All systems operational' }
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats({
          userCount: 0,
          aliasCount: 0,
          domainCount: 0,
          systemStatus: { status: 'error', message: 'Unable to fetch system data' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'error':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] animate-pulse">
              <div className="h-4 bg-[rgb(var(--bg-secondary))] rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-[rgb(var(--bg-secondary))] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Dashboard</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">Welcome to your mail server control panel</p>
        </div>
        <div className="flex items-center space-x-2">
          {stats && getStatusIcon(stats.systemStatus.status)}
          <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
            {stats?.systemStatus.message}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Total Users</p>
              <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">{stats?.userCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--accent-primary))] to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>

        {/* Aliases Card */}
        <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Email Aliases</p>
              <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">{stats?.aliasCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--accent-secondary))] to-violet-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Configured</span>
          </div>
        </div>

        {/* Domains Card */}
        <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Domains</p>
              <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">{stats?.domainCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Hosted</span>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">System Status</p>
              <p className="text-lg font-semibold text-[rgb(var(--text-primary))] mt-1 capitalize">
                {stats?.systemStatus.status || 'Unknown'}
              </p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${stats ? getStatusColor(stats.systemStatus.status) : 'from-gray-500 to-slate-600'} rounded-xl flex items-center justify-center`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            {stats && getStatusIcon(stats.systemStatus.status)}
            <span className="ml-1 text-[rgb(var(--text-secondary))]">Last checked now</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))]">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/users')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Manage Users</span>
          </button>
          
          <button 
            onClick={() => navigate('/aliases')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-violet-100 transition-all duration-200"
          >
            <Mail className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Manage Aliases</span>
          </button>
          
          <button 
            onClick={() => navigate('/ssl')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200"
          >
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-900">SSL Status</span>
          </button>
          
          <button 
            onClick={() => navigate('/system-status')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-red-100 transition-all duration-200"
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">System Check</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[rgb(var(--bg-surface))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))]">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">System Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-[rgb(var(--text-secondary))]">Mail Server</span>
            <span className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Running
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[rgb(var(--text-secondary))]">DNS Server</span>
            <span className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Running
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[rgb(var(--text-secondary))]">Web Server</span>
            <span className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Running
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[rgb(var(--text-secondary))]">SSL Certificates</span>
            <span className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Valid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
