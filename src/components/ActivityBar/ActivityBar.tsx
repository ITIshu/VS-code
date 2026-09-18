import React, { useState, useRef, useEffect } from 'react';
import {
  Files,
  Search,
  GitBranch,
  Play,
  Puzzle,
  Settings,
  User,
  Sliders,
  Palette,
  Terminal,
  Sparkles,
  Globe,
  Activity,
} from 'lucide-react';
import { ActiveSideBarView } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';

interface ActivityBarProps {
  currentTheme: VSCodeThemeDefinition;
  activeView: ActiveSideBarView | null;
  onSelectView: (view: ActiveSideBarView) => void;
  modifiedCount: number;
  pluginsCount: number;
  onOpenSettings: () => void;
  onOpenThemePicker: () => void;
  onToggleTerminal: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  currentTheme,
  activeView,
  onSelectView,
  modifiedCount,
  pluginsCount,
  onOpenSettings,
  onOpenThemePicker,
  onToggleTerminal,
}) => {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items: Array<{ id: ActiveSideBarView; label: string; icon: React.ReactNode; badge?: number | string }> = [
    {
      id: 'explorer',
      label: 'Explorer (Ctrl+Shift+E)',
      icon: <Files size={21} strokeWidth={1.6} />,
    },
    {
      id: 'ai-assistant',
      label: 'Nova AI Copilot (Next-Gen Intelligence)',
      icon: <Sparkles size={21} strokeWidth={1.6} className="text-sky-400" />,
      badge: 'AI',
    },
    {
      id: 'rest-client',
      label: 'REST API Client (Integrated Testing)',
      icon: <Globe size={21} strokeWidth={1.6} className="text-emerald-400" />,
    },
    {
      id: 'code-radar',
      label: 'Code Radar (Quality & Health Metrics)',
      icon: <Activity size={21} strokeWidth={1.6} className="text-purple-400" />,
    },
    {
      id: 'search',
      label: 'Search (Ctrl+Shift+F)',
      icon: <Search size={21} strokeWidth={1.6} />,
    },
    {
      id: 'git',
      label: 'Source Control (Ctrl+Shift+G)',
      icon: <GitBranch size={21} strokeWidth={1.6} />,
      badge: modifiedCount > 0 ? modifiedCount : undefined,
    },
    {
      id: 'extensions',
      label: 'Extensions & Plugins (Ctrl+Shift+X)',
      icon: <Puzzle size={21} strokeWidth={1.6} />,
      badge: pluginsCount,
    },
    {
      id: 'settings',
      label: 'Settings & Workspace Preferences',
      icon: <Sliders size={21} strokeWidth={1.6} />,
    },
  ];

  return (
    <div
      id="vscode-activity-bar"
      className="w-12 h-full flex flex-col justify-between items-center py-2 select-none shrink-0 border-r z-30"
      style={{
        backgroundColor: currentTheme.ui.activityBarBg,
        borderColor: currentTheme.ui.sideBarBorder,
      }}
    >
      {/* Top Icons */}
      <div className="flex flex-col items-center w-full space-y-2">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative w-full flex justify-center group">
              {/* Active Left Indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ backgroundColor: currentTheme.ui.activityBarActiveBorder }}
                />
              )}
              <button
                id={`activity-${item.id}-btn`}
                onClick={() => onSelectView(item.id)}
                title={item.label}
                className={`p-2.5 rounded-sm transition-colors relative flex items-center justify-center ${
                  isActive
                    ? 'text-white opacity-100'
                    : 'text-[#858585] hover:text-[#d4d4d4] opacity-85 hover:opacity-100'
                }`}
              >
                {item.icon}
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className={`absolute bottom-0.5 right-0.5 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center border border-[#1e1e1e] ${
                    item.badge === 'AI' ? 'bg-gradient-to-r from-sky-500 to-indigo-600' : 'bg-[#007acc]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center w-full space-y-1" ref={settingsRef}>
        <button
          id="activity-account-btn"
          title="Accounts"
          className="p-2.5 text-[#858585] hover:text-[#d4d4d4] transition-colors"
        >
          <User size={20} strokeWidth={1.5} />
        </button>

        <div className="relative w-full flex justify-center">
          <button
            id="activity-settings-btn"
            title="Manage"
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
            className={`p-2.5 text-[#858585] hover:text-[#d4d4d4] transition-colors rounded-sm ${
              isSettingsMenuOpen ? 'text-white' : ''
            }`}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>

          {/* Manage Popup Menu */}
          {isSettingsMenuOpen && (
            <div
              className="absolute left-12 bottom-0 mb-1 w-52 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
              style={{
                backgroundColor: currentTheme.ui.sideBarBg,
                borderColor: currentTheme.ui.sideBarBorder,
                color: currentTheme.ui.sideBarFg,
              }}
            >
              <button
                onClick={() => {
                  onOpenSettings();
                  setIsSettingsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sliders size={13} /> Settings
                </span>
                <span className="text-[10px] opacity-60">Ctrl+,</span>
              </button>
              <button
                onClick={() => {
                  onOpenThemePicker();
                  setIsSettingsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Palette size={13} /> Color Theme
                </span>
                <span className="text-[10px] opacity-60">Ctrl+K Ctrl+T</span>
              </button>
              <button
                onClick={() => {
                  onToggleTerminal();
                  setIsSettingsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Terminal size={13} /> Toggle Terminal
                </span>
                <span className="text-[10px] opacity-60">Ctrl+`</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
