import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  toggleMode: () => void;
  setColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    const stored = localStorage.getItem('mailosaurus-theme');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Invalid theme data in localStorage');
      }
    }
    
    // Default theme
    return {
      mode: 'light',
      color: 'blue'
    };
  });

  useEffect(() => {
    localStorage.setItem('mailosaurus-theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme);
  };

  const toggleMode = () => {
    setThemeState(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };

  const setColor = (color: ThemeColor) => {
    setThemeState(prev => ({
      ...prev,
      color
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  
  // Apply mode classes
  root.classList.remove('light', 'dark');
  root.classList.add(theme.mode);
  
  // Apply color theme classes
  root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red');
  root.classList.add(`theme-${theme.color}`);
  
  // Define CSS custom properties for themes
  const themes = {
    light: {
      blue: {
        '--bg-primary': '248 250 252', // slate-50
        '--bg-secondary': '241 245 249', // slate-100
        '--bg-surface': '255 255 255', // white
        '--bg-nav': '15 23 42', // slate-900
        '--bg-nav-secondary': '30 41 59', // slate-800
        '--text-primary': '15 23 42', // slate-900
        '--text-secondary': '64 748 731', // slate-600
        '--text-muted': '148 163 184', // slate-400
        '--text-nav': '255 255 255', // white
        '--text-nav-secondary': '203 213 225', // slate-300
        '--accent-primary': '59 130 246', // blue-500
        '--accent-secondary': '147 51 234', // purple-600
        '--border': '226 232 240', // slate-200
        '--border-nav': '255 255 255 / 0.1',
      },
      green: {
        '--bg-primary': '240 253 244', // green-50
        '--bg-secondary': '220 252 231', // green-100
        '--bg-surface': '255 255 255',
        '--bg-nav': '20 83 45', // green-900
        '--bg-nav-secondary': '22 101 52', // green-800
        '--text-primary': '20 83 45',
        '--text-secondary': '75 85 99',
        '--text-muted': '156 163 175',
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '187 247 208', // green-200
        '--accent-primary': '34 197 94', // green-500
        '--accent-secondary': '168 85 247', // purple-500
        '--border': '229 231 235',
        '--border-nav': '255 255 255 / 0.1',
      },
      purple: {
        '--bg-primary': '250 245 255', // purple-50
        '--bg-secondary': '243 232 255', // purple-100
        '--bg-surface': '255 255 255',
        '--bg-nav': '88 28 135', // purple-900
        '--bg-nav-secondary': '107 33 168', // purple-800
        '--text-primary': '88 28 135',
        '--text-secondary': '75 85 99',
        '--text-muted': '156 163 175',
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '221 214 254', // purple-200
        '--accent-primary': '168 85 247', // purple-500
        '--accent-secondary': '59 130 246', // blue-500
        '--border': '229 231 235',
        '--border-nav': '255 255 255 / 0.1',
      },
      orange: {
        '--bg-primary': '255 251 235', // orange-50
        '--bg-secondary': '254 243 199', // orange-100
        '--bg-surface': '255 255 255',
        '--bg-nav': '154 52 18', // orange-900
        '--bg-nav-secondary': '194 65 12', // orange-800
        '--text-primary': '154 52 18',
        '--text-secondary': '75 85 99',
        '--text-muted': '156 163 175',
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '254 215 170', // orange-200
        '--accent-primary': '249 115 22', // orange-500
        '--accent-secondary': '168 85 247', // purple-500
        '--border': '229 231 235',
        '--border-nav': '255 255 255 / 0.1',
      },
      red: {
        '--bg-primary': '254 242 242', // red-50
        '--bg-secondary': '254 226 226', // red-100
        '--bg-surface': '255 255 255',
        '--bg-nav': '127 29 29', // red-900
        '--bg-nav-secondary': '153 27 27', // red-800
        '--text-primary': '127 29 29',
        '--text-secondary': '75 85 99',
        '--text-muted': '156 163 175',
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '254 202 202', // red-200
        '--accent-primary': '239 68 68', // red-500
        '--accent-secondary': '168 85 247', // purple-500
        '--border': '229 231 235',
        '--border-nav': '255 255 255 / 0.1',
      }
    },
    dark: {
      blue: {
        '--bg-primary': '15 23 42', // slate-900
        '--bg-secondary': '30 41 59', // slate-800
        '--bg-surface': '51 65 85', // slate-700
        '--bg-nav': '2 6 23', // slate-950
        '--bg-nav-secondary': '15 23 42', // slate-900
        '--text-primary': '248 250 252', // slate-50
        '--text-secondary': '203 213 225', // slate-300
        '--text-muted': '148 163 184', // slate-400
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '203 213 225',
        '--accent-primary': '96 165 250', // blue-400
        '--accent-secondary': '196 181 253', // purple-300
        '--border': '51 65 85', // slate-700
        '--border-nav': '255 255 255 / 0.1',
      },
      green: {
        '--bg-primary': '20 83 45', // green-900
        '--bg-secondary': '22 101 52', // green-800
        '--bg-surface': '34 197 94', // green-700
        '--bg-nav': '5 46 22', // green-950
        '--bg-nav-secondary': '20 83 45', // green-900
        '--text-primary': '240 253 244', // green-50
        '--text-secondary': '187 247 208', // green-200
        '--text-muted': '134 239 172', // green-300
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '187 247 208',
        '--accent-primary': '74 222 128', // green-400
        '--accent-secondary': '196 181 253', // purple-300
        '--border': '22 163 74', // green-600
        '--border-nav': '255 255 255 / 0.1',
      },
      purple: {
        '--bg-primary': '88 28 135', // purple-900
        '--bg-secondary': '107 33 168', // purple-800
        '--bg-surface': '126 34 206', // purple-700
        '--bg-nav': '59 7 100', // purple-950
        '--bg-nav-secondary': '88 28 135', // purple-900
        '--text-primary': '250 245 255', // purple-50
        '--text-secondary': '221 214 254', // purple-200
        '--text-muted': '196 181 253', // purple-300
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '221 214 254',
        '--accent-primary': '196 181 253', // purple-300
        '--accent-secondary': '147 197 253', // blue-300
        '--border': '147 51 234', // purple-600
        '--border-nav': '255 255 255 / 0.1',
      },
      orange: {
        '--bg-primary': '154 52 18', // orange-900
        '--bg-secondary': '194 65 12', // orange-800
        '--bg-surface': '234 88 12', // orange-700
        '--bg-nav': '67 20 7', // orange-950
        '--bg-nav-secondary': '154 52 18', // orange-900
        '--text-primary': '255 251 235', // orange-50
        '--text-secondary': '254 215 170', // orange-200
        '--text-muted': '253 186 116', // orange-300
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '254 215 170',
        '--accent-primary': '251 146 60', // orange-400
        '--accent-secondary': '196 181 253', // purple-300
        '--border': '249 115 22', // orange-500
        '--border-nav': '255 255 255 / 0.1',
      },
      red: {
        '--bg-primary': '127 29 29', // red-900
        '--bg-secondary': '153 27 27', // red-800
        '--bg-surface': '185 28 28', // red-700
        '--bg-nav': '69 10 10', // red-950
        '--bg-nav-secondary': '127 29 29', // red-900
        '--text-primary': '254 242 242', // red-50
        '--text-secondary': '254 202 202', // red-200
        '--text-muted': '252 165 165', // red-300
        '--text-nav': '255 255 255',
        '--text-nav-secondary': '254 202 202',
        '--accent-primary': '248 113 113', // red-400
        '--accent-secondary': '196 181 253', // purple-300
        '--border': '239 68 68', // red-500
        '--border-nav': '255 255 255 / 0.1',
      }
    }
  };

  const modeThemes = themes[theme.mode];
  const colorTheme = modeThemes[theme.color];

  // Apply CSS custom properties
  Object.entries(colorTheme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}