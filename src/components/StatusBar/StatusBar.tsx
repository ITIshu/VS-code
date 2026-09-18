import React, { useState } from 'react';
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  Code2,
} from 'lucide-react';
import { VSCodeThemeDefinition } from '../../services/themes';
import { StatusBarItemRef } from '../../types/plugin';

interface StatusBarProps {
  currentTheme: VSCodeThemeDefinition;
  cursorLine: number;
  cursorCol: number;
  errorCount: number;
  warningCount: number;
  language: string;
  tabSize: number;
  pluginItems: StatusBarItemRef[];
  onToggleProblems: () => void;
  onRunPluginCommand: (cmdId: string) => void;
  onSelectLanguage: (lang: string) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentTheme,
  cursorLine,
  cursorCol,
  errorCount,
  warningCount,
  language,
  tabSize,
  pluginItems,
  onToggleProblems,
  onRunPluginCommand,
  onSelectLanguage,
}) => {
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);

  const leftItems = pluginItems.filter((item) => item.alignment === 'left');
  const rightItems = pluginItems.filter((item) => item.alignment !== 'left');

  const supportedLangs = [
    'typescript',
    'javascript',
    'python',
    'json',
    'css',
    'html',
    'markdown',
    'sql',
    'rust',
    'plaintext',
  ];

  return (
    <div
      id="vscode-status-bar"
      className="flex items-center justify-between h-[22px] px-2 text-[11px] select-none shrink-0 z-30 font-sans"
      style={{
        backgroundColor: currentTheme.ui.statusBarBg,
        color: currentTheme.ui.statusBarFg,
      }}
    >
      {/* Left Items */}
      <div className="flex items-center space-x-1 h-full">
        {/* Remote badge */}
        <div
          title="Nova Cloud Sandbox (Real-time Container)"
          className="flex items-center gap-1 px-2 h-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white cursor-pointer font-bold tracking-wider text-[10px]"
        >
          <span>NOVA CLOUD</span>
        </div>

        {/* Git Branch */}
        <div
          title="Git Branch: main"
          className="flex items-center gap-1 px-1.5 h-full hover:bg-white/10 cursor-pointer"
        >
          <GitBranch size={11} />
          <span>main*</span>
        </div>

        {/* Problems Item */}
        <button
          onClick={onToggleProblems}
          title="Toggle Problems Panel"
          className="flex items-center gap-2 px-1.5 h-full hover:bg-white/10 cursor-pointer"
        >
          <span className="flex items-center gap-0.5">
            <AlertCircle size={11} />
            <span>{errorCount}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <AlertTriangle size={11} />
            <span>{warningCount}</span>
          </span>
        </button>

        {/* Plugin Left Items */}
        {leftItems.map((item) => (
          <button
            key={item.id}
            title={item.tooltip}
            onClick={() => item.command && onRunPluginCommand(item.command)}
            className="flex items-center gap-1 px-1.5 h-full hover:bg-white/10 cursor-pointer text-white"
          >
            <span>{item.text}</span>
          </button>
        ))}
      </div>

      {/* Right Items */}
      <div className="flex items-center space-x-1 h-full">
        {/* Plugin Right Items */}
        {rightItems.map((item) => (
          <button
            key={item.id}
            title={item.tooltip}
            onClick={() => item.command && onRunPluginCommand(item.command)}
            className="flex items-center gap-1 px-1.5 h-full hover:bg-white/10 cursor-pointer text-white"
          >
            <span>{item.text}</span>
          </button>
        ))}

        {/* Cursor Position */}
        <div className="px-1.5 h-full flex items-center hover:bg-white/10 cursor-pointer">
          Ln {cursorLine}, Col {cursorCol}
        </div>

        {/* Spaces */}
        <div className="px-1.5 h-full flex items-center hover:bg-white/10 cursor-pointer">
          Spaces: {tabSize}
        </div>

        {/* Encoding */}
        <div className="px-1.5 h-full flex items-center hover:bg-white/10 cursor-pointer">
          UTF-8
        </div>

        {/* End of Line */}
        <div className="px-1.5 h-full flex items-center hover:bg-white/10 cursor-pointer">
          LF
        </div>

        {/* Language Picker Dropdown */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => setIsLangPickerOpen(!isLangPickerOpen)}
            title="Select Language Mode"
            className="px-1.5 h-full flex items-center capitalize hover:bg-white/10 cursor-pointer"
          >
            {language || 'Plain Text'}
          </button>

          {isLangPickerOpen && (
            <div
              className="absolute bottom-full right-0 mb-1 w-44 rounded-md shadow-2xl py-1 text-[11px] border z-50 backdrop-blur-sm"
              style={{
                backgroundColor: currentTheme.ui.sideBarBg,
                borderColor: currentTheme.ui.sideBarBorder,
                color: currentTheme.ui.sideBarFg,
              }}
            >
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#888888] border-b border-white/10">
                Language Mode
              </div>
              {supportedLangs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onSelectLanguage(lang);
                    setIsLangPickerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1 flex items-center justify-between hover:bg-[#007acc] hover:text-white capitalize ${
                    language === lang ? 'font-bold text-[#007acc]' : ''
                  }`}
                >
                  <span>{lang}</span>
                  {language === lang && <Check size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div
          title="Notifications"
          className="px-1.5 h-full flex items-center hover:bg-white/10 cursor-pointer"
        >
          <Bell size={11} />
        </div>
      </div>
    </div>
  );
};
