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
  AtSign,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeSelector from './ThemeSelector';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Aliases', href: '/aliases', icon: AtSign },
  { name: 'Mail Guide', href: '/mail-guide', icon: Mail },
  { name: 'Email Reports', href: '/email-reports', icon: FileText },
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
          className="p-2 rounded-xl bg-[rgb(var(--bg-surface))/0.1] backdrop-blur-md border border-[rgb(var(--border-nav))] text-[rgb(var(--text-nav))] hover:bg-[rgb(var(--bg-surface))/0.2] transition-all duration-200"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[rgb(var(--bg-nav))] 
        backdrop-blur-xl border-r border-[rgb(var(--border-nav))] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[rgb(var(--border-nav))]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[rgb(var(--text-nav))]">Mailosaurus</h1>
                <p className="text-sm text-[rgb(var(--text-nav-secondary))]">Control Panel</p>
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
                      ? 'bg-[rgb(var(--bg-surface))/0.1] text-[rgb(var(--text-nav))] border border-[rgb(var(--border-nav))] shadow-lg' 
                      : 'text-[rgb(var(--text-nav-secondary))] hover:text-[rgb(var(--text-nav))] hover:bg-[rgb(var(--bg-surface))/0.05]'
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
          <div className="p-4 border-t border-[rgb(var(--border-nav))]">
            {/* Theme Selector */}
            <div className="mb-4">
              <ThemeSelector />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-lg flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-nav))]">Administrator</p>
                  <p className="text-xs text-[rgb(var(--text-nav-secondary))]">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[rgb(var(--text-nav-secondary))] hover:text-[rgb(var(--text-nav))] hover:bg-[rgb(var(--bg-surface))/0.05] transition-colors"
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
