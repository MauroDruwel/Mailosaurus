import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Globe,
  Settings,
  Activity,
  HardDrive,
  LogOut,
  Menu,
  X,
  Users,
  AtSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Aliases', href: '/aliases', icon: AtSign },
  { name: 'Mail Guide', href: '/mail-guide', icon: Mail },
  { name: 'System Status', href: '/system-status', icon: Activity },
  { name: 'SSL Certificates', href: '/ssl', icon: Shield },
  { name: 'Web', href: '/web', icon: Globe },
  { name: 'Custom DNS', href: '/custom-dns', icon: Globe },
  { name: 'External DNS', href: '/external-dns', icon: Globe },
  { name: 'System Backup', href: '/system-backup', icon: HardDrive },
  { name: 'MFA', href: '/mfa', icon: Settings },
  { name: 'Munin', href: '/munin', icon: Activity },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.hash = '#/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 to-slate-800 
        backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Mailosaurus</h1>
                <p className="text-sm text-slate-400">Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Administrator</p>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
