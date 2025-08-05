import { useState } from 'react';
import { 
  Activity, 
  ExternalLink,
  Monitor,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Info,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export default function MuninPage() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const monitoringCategories = [
    {
      title: 'System Resources',
      icon: Server,
      color: 'blue',
      metrics: [
        { name: 'CPU Usage', description: 'Processor utilization over time' },
        { name: 'Memory Usage', description: 'RAM and swap usage' },
        { name: 'Disk Usage', description: 'Storage space utilization' },
        { name: 'Load Average', description: 'System load over time' }
      ]
    },
    {
      title: 'Network Activity',
      icon: Network,
      color: 'green',
      metrics: [
        { name: 'Network Traffic', description: 'Incoming and outgoing bandwidth' },
        { name: 'Network Connections', description: 'Active network connections' },
        { name: 'Firewall Activity', description: 'Blocked and allowed connections' },
        { name: 'DNS Queries', description: 'DNS resolution activity' }
      ]
    },
    {
      title: 'Mail Services',
      icon: MemoryStick,
      color: 'purple',
      metrics: [
        { name: 'Mail Queue', description: 'Emails waiting to be delivered' },
        { name: 'SMTP Connections', description: 'Active SMTP sessions' },
        { name: 'IMAP Connections', description: 'Active IMAP sessions' },
        { name: 'Mail Volume', description: 'Email send/receive statistics' }
      ]
    },
    {
      title: 'Web Services',
      icon: Monitor,
      color: 'orange',
      metrics: [
        { name: 'HTTP Requests', description: 'Web server request volume' },
        { name: 'Response Times', description: 'Web server performance' },
        { name: 'SSL Certificates', description: 'Certificate expiration monitoring' },
        { name: 'Error Rates', description: 'HTTP error statistics' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-cyan-600 border-blue-200 bg-blue-50',
      green: 'from-green-500 to-emerald-600 border-green-200 bg-green-50',
      purple: 'from-purple-500 to-violet-600 border-purple-200 bg-purple-50',
      orange: 'from-orange-500 to-red-600 border-orange-200 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Munin</h1>
          <p className="text-slate-600 mt-1">System monitoring and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href="/munin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Open Munin</span>
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Monitoring Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Data Retention</p>
              <p className="text-xl font-bold text-blue-600">5 years</p>
            </div>
            <HardDrive className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Update Interval</p>
              <p className="text-xl font-bold text-purple-600">5 min</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Metric Categories</p>
              <p className="text-xl font-bold text-orange-600">{monitoringCategories.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Monitoring Categories */}
      <div className="space-y-6">
        {monitoringCategories.map((category, index) => {
          const Icon = category.icon;
          const colorClasses = getColorClasses(category.color);
          
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className={`px-6 py-4 border-b border-slate-200 ${colorClasses.split(' ')[2]} ${colorClasses.split(' ')[3]}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">{metric.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{metric.description}</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Access Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <Monitor className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Accessing Munin</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600">
            Munin provides detailed system monitoring with historical data and trend analysis.
          </p>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Munin Web Interface</p>
                <p className="text-sm text-blue-700">
                  Access comprehensive monitoring graphs and statistics
                </p>
              </div>
              <a
                href="/munin/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Munin</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2">Real-time Monitoring</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 5-minute update intervals</li>
                <li>• Live system performance data</li>
                <li>• Resource usage tracking</li>
                <li>• Service health monitoring</li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2">Historical Data</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 5 years of data retention</li>
                <li>• Trend analysis and patterns</li>
                <li>• Performance comparisons</li>
                <li>• Capacity planning insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Key Performance Indicators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <Cpu className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-blue-900 mb-2">CPU Performance</h3>
            <p className="text-sm text-blue-700">Monitor processor usage, load average, and system performance</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <Network className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-medium text-green-900 mb-2">Network Activity</h3>
            <p className="text-sm text-green-700">Track bandwidth usage, connections, and network health</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
            <HardDrive className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-medium text-purple-900 mb-2">Storage Health</h3>
            <p className="text-sm text-purple-700">Monitor disk usage, I/O performance, and storage trends</p>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">About Munin Monitoring</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Munin automatically monitors your mail server performance</li>
              <li>• Graphs are updated every 5 minutes with the latest data</li>
              <li>• Historical data helps identify trends and plan for capacity</li>
              <li>• Use the monitoring data to optimize server performance</li>
              <li>• All monitoring data is stored locally for privacy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}