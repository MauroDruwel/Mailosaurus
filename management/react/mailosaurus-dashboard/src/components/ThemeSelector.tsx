import { useState } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme, type ThemeColor, type ThemeMode } from '../hooks/useTheme';

const colorOptions: { value: ThemeColor; name: string; colors: string }[] = [
  { value: 'blue', name: 'Ocean Blue', colors: 'from-blue-500 to-purple-600' },
  { value: 'green', name: 'Forest Green', colors: 'from-green-500 to-emerald-600' },
  { value: 'purple', name: 'Royal Purple', colors: 'from-purple-500 to-violet-600' },
  { value: 'orange', name: 'Sunset Orange', colors: 'from-orange-500 to-red-500' },
  { value: 'red', name: 'Ruby Red', colors: 'from-red-500 to-pink-600' },
];

const modeOptions: { value: ThemeMode; name: string; icon: typeof Sun }[] = [
  { value: 'light', name: 'Light Mode', icon: Sun },
  { value: 'dark', name: 'Dark Mode', icon: Moon },
];

export default function ThemeSelector() {
  const { theme, setColor, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-[rgb(var(--text-nav-secondary))] hover:text-[rgb(var(--text-nav))] hover:bg-[rgb(var(--border-nav))] transition-colors"
        title="Theme Settings"
      >
        <Palette size={16} />
        <span className="text-sm hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border))] rounded-xl shadow-xl z-50 p-4">
            {/* Dark/Light Mode Toggle */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2">Appearance</h3>
              <div className="grid grid-cols-2 gap-2">
                {modeOptions.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = theme.mode === mode.value;
                  
                  return (
                    <button
                      key={mode.value}
                      onClick={() => toggleMode()}
                      className={`
                        flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-200
                        ${isActive 
                          ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))]' 
                          : 'border-[rgb(var(--border))] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))]'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{mode.name.split(' ')[0]}</span>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Theme Selection */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2">Color Theme</h3>
              <div className="space-y-2">
                {colorOptions.map((color) => {
                  const isActive = theme.color === color.value;
                  
                  return (
                    <button
                      key={color.value}
                      onClick={() => setColor(color.value)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                        ${isActive 
                          ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))/0.1]' 
                          : 'border-[rgb(var(--border))] hover:border-[rgb(var(--accent-primary))]'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color.colors}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>
                          {color.name}
                        </span>
                      </div>
                      {isActive && <Check size={16} className="text-[rgb(var(--accent-primary))]" />}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Theme Preview */}
            <div className="mt-4 p-3 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
              <div className="text-xs text-[rgb(var(--text-muted))] mb-1">Preview</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[rgb(var(--accent-primary))]" />
                <div className="w-3 h-3 rounded-full bg-[rgb(var(--accent-secondary))]" />
                <span className="text-sm text-[rgb(var(--text-primary))]">
                  {theme.mode === 'dark' ? 'Dark' : 'Light'} • {colorOptions.find(c => c.value === theme.color)?.name}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}