import React from 'react';
import { EditorSettings } from '../../types';
import { THEMES } from '../../services/themes';
import { RotateCcw } from 'lucide-react';

interface SettingsViewProps {
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onResetWorkspace: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetWorkspace,
}) => {
  return (
    <div className="flex flex-col h-full select-none text-[12px] overflow-y-auto p-4 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Editor Settings</h2>
        <p className="text-[11px] text-[#888888]">
          Configure editor preferences, themes, and formatting.
        </p>
      </div>

      {/* Theme Selector */}
      <div className="space-y-1.5">
        <label className="text-white font-medium text-[12px] block">Color Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => onUpdateSettings({ theme: e.target.value })}
          className="w-full bg-[#222222] border border-[#3c3c3c] text-white rounded p-1.5 text-[12px] outline-none focus:border-[#007acc]"
        >
          {Object.values(THEMES).map((th) => (
            <option key={th.id} value={th.id}>
              {th.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-[#888888]">
          Specifies the color theme used in the workbench and editor.
        </span>
      </div>

      {/* Font Size */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-white font-medium text-[12px]">Editor: Font Size</label>
          <span className="text-[#007acc] font-mono font-bold text-[12px]">
            {settings.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min="11"
          max="24"
          step="1"
          value={settings.fontSize}
          onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
          className="w-full accent-[#007acc]"
        />
        <span className="text-[11px] text-[#888888]">
          Controls the font size in pixels for the editor buffer.
        </span>
      </div>

      {/* Tab Size */}
      <div className="space-y-1.5">
        <label className="text-white font-medium text-[12px] block">Editor: Tab Size</label>
        <div className="flex items-center gap-2">
          {[2, 4].map((size) => (
            <button
              key={size}
              onClick={() => onUpdateSettings({ tabSize: size })}
              className={`flex-1 py-1.5 rounded border text-[12px] transition-colors ${
                settings.tabSize === size
                  ? 'bg-[#007acc] border-[#007acc] text-white font-bold'
                  : 'bg-[#222222] border-[#3c3c3c] text-[#cccccc] hover:border-[#666666]'
              }`}
            >
              {size} Spaces
            </button>
          ))}
        </div>
      </div>

      {/* Word Wrap */}
      <div className="space-y-1.5">
        <label className="text-white font-medium text-[12px] block">Editor: Word Wrap</label>
        <div className="flex items-center gap-2">
          {(['on', 'off'] as const).map((wrap) => (
            <button
              key={wrap}
              onClick={() => onUpdateSettings({ wordWrap: wrap })}
              className={`flex-1 py-1.5 rounded border text-[12px] uppercase font-bold transition-colors ${
                settings.wordWrap === wrap
                  ? 'bg-[#007acc] border-[#007acc] text-white'
                  : 'bg-[#222222] border-[#3c3c3c] text-[#cccccc] hover:border-[#666666]'
              }`}
            >
              {wrap}
            </button>
          ))}
        </div>
      </div>

      {/* Minimap Toggle */}
      <div className="flex items-center justify-between py-1 border-t border-[#2b2b2b] pt-3">
        <div>
          <div className="text-white font-medium text-[12px]">Editor: Minimap</div>
          <div className="text-[11px] text-[#888888]">
            Controls whether the code minimap is shown on the right side.
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.minimap}
          onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
          className="w-4 h-4 accent-[#007acc] cursor-pointer"
        />
      </div>

      {/* Line Numbers */}
      <div className="space-y-1.5 border-t border-[#2b2b2b] pt-3">
        <label className="text-white font-medium text-[12px] block">Editor: Line Numbers</label>
        <select
          value={settings.lineNumbers}
          onChange={(e) =>
            onUpdateSettings({ lineNumbers: e.target.value as 'on' | 'off' | 'relative' })
          }
          className="w-full bg-[#222222] border border-[#3c3c3c] text-white rounded p-1.5 text-[12px] outline-none focus:border-[#007acc]"
        >
          <option value="on">On (Sequential)</option>
          <option value="relative">Relative</option>
          <option value="off">Off</option>
        </select>
      </div>

      {/* Format On Save */}
      <div className="flex items-center justify-between py-1 border-t border-[#2b2b2b] pt-3">
        <div>
          <div className="text-white font-medium text-[12px]">Editor: Format On Save</div>
          <div className="text-[11px] text-[#888888]">
            Format file with Prettier automatically whenever saved.
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.formatOnSave}
          onChange={(e) => onUpdateSettings({ formatOnSave: e.target.checked })}
          className="w-4 h-4 accent-[#007acc] cursor-pointer"
        />
      </div>

      {/* Auto Save */}
      <div className="flex items-center justify-between py-1 border-t border-[#2b2b2b] pt-3">
        <div>
          <div className="text-white font-medium text-[12px]">Files: Auto Save</div>
          <div className="text-[11px] text-[#888888]">
            Automatically saves dirty files after a brief delay.
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.autoSave}
          onChange={(e) => onUpdateSettings({ autoSave: e.target.checked })}
          className="w-4 h-4 accent-[#007acc] cursor-pointer"
        />
      </div>

      {/* Reset Section */}
      <div className="border-t border-[#2b2b2b] pt-4">
        <button
          onClick={() => {
            if (confirm('Reset entire workspace files to starter kit?')) {
              onResetWorkspace();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 rounded text-[12px] font-medium transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset Workspace to Defaults</span>
        </button>
      </div>
    </div>
  );
};
