import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Columns,
  PanelBottom,
  Sidebar as SidebarIcon,
  Search,
  BookOpen,
  Sparkles,
  ChevronDown,
  FileCode,
  FolderPlus,
  FilePlus,
  Save,
  RotateCcw,
  Download,
  Code2,
  Zap,
} from 'lucide-react';
import { THEMES, VSCodeThemeDefinition } from '../../services/themes';

interface TitleBarProps {
  currentTheme: VSCodeThemeDefinition;
  onSelectTheme: (themeId: string) => void;
  activeFileName?: string;
  onOpenFilePalette: () => void;
  onOpenCommandPalette: () => void;
  onRunCode: () => void;
  onToggleSidebar: () => void;
  onTogglePanel: () => void;
  onToggleSplit: () => void;
  isSplit: boolean;
  onSaveActiveFile: () => void;
  onFormatDocument: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onResetWorkspace: () => void;
  onDownloadProject: () => void;
  onToggleMarkdownPreview: () => void;
  isMarkdownActive: boolean;
  isMarkdownPreviewOpen: boolean;
  onToggleLivePreview: () => void;
  isLivePreviewOpen: boolean;
  onOpenAiAssistant: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentTheme,
  onSelectTheme,
  activeFileName,
  onOpenFilePalette,
  onOpenCommandPalette,
  onRunCode,
  onToggleSidebar,
  onTogglePanel,
  onToggleSplit,
  isSplit,
  onSaveActiveFile,
  onFormatDocument,
  onNewFile,
  onNewFolder,
  onResetWorkspace,
  onDownloadProject,
  onToggleMarkdownPreview,
  isMarkdownActive,
  isMarkdownPreviewOpen,
  onToggleLivePreview,
  isLivePreviewOpen,
  onOpenAiAssistant,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setIsThemePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      id="vscode-title-bar"
      className="flex items-center justify-between h-[34px] px-2 text-[12px] select-none border-b shrink-0 z-40 transition-colors"
      style={{
        backgroundColor: currentTheme.ui.titleBarBg,
        color: currentTheme.ui.titleBarFg,
        borderColor: currentTheme.ui.sideBarBorder,
      }}
      ref={menuRef}
    >
      {/* Left: Nova Studio Logo & Menu Items */}
      <div className="flex items-center space-x-1">
        <div
          className="flex items-center gap-1.5 pr-2 pl-1 cursor-pointer"
          title="Nova Studio Pro - Enterprise Cloud IDE"
        >
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-[1px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f17] rounded-[3px] flex items-center justify-center">
              <Zap size={11} className="text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-[12px] tracking-tight bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            NOVA
          </span>
          <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            PRO
          </span>
        </div>

        {/* Menu Bar */}
        <div className="relative flex items-center space-x-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              id="menu-file-btn"
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-0.5 rounded text-[12px] hover:bg-white/10 transition-colors ${
                activeMenu === 'file' ? 'bg-white/15' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div
                className="absolute left-0 top-full mt-1 w-52 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.ui.sideBarBg,
                  borderColor: currentTheme.ui.sideBarBorder,
                  color: currentTheme.ui.sideBarFg,
                }}
              >
                <button
                  onClick={() => {
                    onNewFile();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <FilePlus size={14} /> New File...
                  </span>
                  <span className="text-[10px] opacity-60">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    onNewFolder();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <FolderPlus size={14} /> New Folder...
                  </span>
                </button>
                <div className="my-1 border-t opacity-20" />
                <button
                  onClick={() => {
                    onSaveActiveFile();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Save size={14} /> Save File
                  </span>
                  <span className="text-[10px] opacity-60">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    onDownloadProject();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Download size={14} /> Export Project Files
                  </span>
                </button>
                <div className="my-1 border-t opacity-20" />
                <button
                  onClick={() => {
                    if (confirm('Reset workspace to initial starter files? Current changes will be replaced.')) {
                      onResetWorkspace();
                    }
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white text-red-400"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw size={14} /> Reset Workspace
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              id="menu-edit-btn"
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2 py-0.5 rounded text-[12px] hover:bg-white/10 transition-colors ${
                activeMenu === 'edit' ? 'bg-white/15' : ''
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div
                className="absolute left-0 top-full mt-1 w-52 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.ui.sideBarBg,
                  borderColor: currentTheme.ui.sideBarBorder,
                  color: currentTheme.ui.sideBarFg,
                }}
              >
                <button
                  onClick={() => {
                    onFormatDocument();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} /> Format Document
                  </span>
                  <span className="text-[10px] opacity-60">Shift+Alt+F</span>
                </button>
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span>Command Palette...</span>
                  <span className="text-[10px] opacity-60">Ctrl+Shift+P</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              id="menu-view-btn"
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2 py-0.5 rounded text-[12px] hover:bg-white/10 transition-colors ${
                activeMenu === 'view' ? 'bg-white/15' : ''
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div
                className="absolute left-0 top-full mt-1 w-52 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.ui.sideBarBg,
                  borderColor: currentTheme.ui.sideBarBorder,
                  color: currentTheme.ui.sideBarFg,
                }}
              >
                <button
                  onClick={() => {
                    onToggleSidebar();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span>Toggle Primary Side Bar</span>
                  <span className="text-[10px] opacity-60">Ctrl+B</span>
                </button>
                <button
                  onClick={() => {
                    onTogglePanel();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span>Toggle Panel</span>
                  <span className="text-[10px] opacity-60">Ctrl+J</span>
                </button>
                <button
                  onClick={() => {
                    onToggleSplit();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span>Split Editor Right</span>
                  <span className="text-[10px] opacity-60">Ctrl+\</span>
                </button>
              </div>
            )}
          </div>

          {/* Run Menu */}
          <div className="relative">
            <button
              id="menu-run-btn"
              onClick={() => setActiveMenu(activeMenu === 'run' ? null : 'run')}
              className={`px-2 py-0.5 rounded text-[12px] hover:bg-white/10 transition-colors ${
                activeMenu === 'run' ? 'bg-white/15' : ''
              }`}
            >
              Run
            </button>
            {activeMenu === 'run' && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.ui.sideBarBg,
                  borderColor: currentTheme.ui.sideBarBorder,
                  color: currentTheme.ui.sideBarFg,
                }}
              >
                <button
                  onClick={() => {
                    onRunCode();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Play size={13} className="text-emerald-400" /> Run Active Code
                  </span>
                  <span className="text-[10px] opacity-60">Ctrl+Alt+N</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Command Palette / Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <button
          id="quick-open-search-bar"
          onClick={onOpenFilePalette}
          className="w-full flex items-center justify-between px-3 py-1 rounded border text-[11px] opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-inner"
          style={{
            backgroundColor: currentTheme.ui.inputBg,
            borderColor: currentTheme.ui.inputBorder,
            color: currentTheme.ui.titleBarFg,
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={13} className="text-sky-400 shrink-0" />
            <span className="truncate text-[#e2e8f0]">
              {activeFileName ? `Nova Studio > ${activeFileName}` : 'Nova Studio • Enterprise Cloud Workspace'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 opacity-60 text-[10px]">
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 font-mono">Ctrl+P</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 font-mono">Ctrl+Shift+P</kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Quick Actions & Theme Switcher */}
      <div className="flex items-center space-x-1.5">
        {/* Nova AI Copilot Button */}
        <button
          id="nova-ai-copilot-top-btn"
          onClick={onOpenAiAssistant}
          title="Nova AI Copilot (Ask, Refactor, Tests)"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-colors text-[11px] font-medium"
        >
          <Sparkles size={12} />
          <span>Nova AI</span>
        </button>

        {/* Live Canvas / Interactive Preview Button */}
        <button
          id="live-canvas-toggle-btn"
          onClick={onToggleLivePreview}
          title="Interactive Live Canvas Preview"
          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors text-[11px] font-medium ${
            isLivePreviewOpen
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
              : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border-purple-500/30'
          }`}
        >
          <Code2 size={12} />
          <span>Live Canvas</span>
        </button>

        {/* Markdown Preview Button (shown for markdown) */}
        {isMarkdownActive && (
          <button
            id="toggle-markdown-btn"
            onClick={onToggleMarkdownPreview}
            title={isMarkdownPreviewOpen ? 'Close Markdown Preview' : 'Open Preview to the Side'}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              isMarkdownPreviewOpen ? 'text-[#007acc] bg-white/10' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <BookOpen size={14} />
          </button>
        )}

        {/* Run Code Button */}
        <button
          id="run-code-top-btn"
          onClick={onRunCode}
          title="Run Active Code (Code Runner Plugin)"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors text-[11px] font-medium"
        >
          <Play size={12} fill="currentColor" />
          <span>Run</span>
        </button>

        {/* Format Document Button */}
        <button
          id="format-doc-btn"
          onClick={onFormatDocument}
          title="Format Document (Prettier Plugin) [Shift+Alt+F]"
          className="p-1 rounded hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
        >
          <Sparkles size={14} />
        </button>

        {/* Split Editor Toggle */}
        <button
          id="split-editor-btn"
          onClick={onToggleSplit}
          title={isSplit ? 'Single Editor View' : 'Split Editor Right'}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${
            isSplit ? 'text-[#007acc] bg-white/10' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Columns size={14} />
        </button>

        {/* Toggle Sidebar */}
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title="Toggle Primary Side Bar [Ctrl+B]"
          className="p-1 rounded hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
        >
          <SidebarIcon size={14} />
        </button>

        {/* Toggle Panel */}
        <button
          id="toggle-panel-btn"
          onClick={onTogglePanel}
          title="Toggle Bottom Panel (Output, Terminal, Problems) [Ctrl+J]"
          className="p-1 rounded hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
        >
          <PanelBottom size={14} />
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            id="theme-switcher-btn"
            onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
            title="Change VS Code Theme"
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-[11px] opacity-90 hover:opacity-100 border border-transparent hover:border-white/15"
          >
            <span>Theme: {currentTheme.label.split(' ')[0]}</span>
            <ChevronDown size={11} className="opacity-60" />
          </button>
          {isThemePickerOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-52 rounded-md shadow-2xl py-1 z-50 text-[12px] border backdrop-blur-sm"
              style={{
                backgroundColor: currentTheme.ui.sideBarBg,
                borderColor: currentTheme.ui.sideBarBorder,
                color: currentTheme.ui.sideBarFg,
              }}
            >
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold opacity-50">
                VS Code Themes
              </div>
              {Object.values(THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    onSelectTheme(th.id);
                    setIsThemePickerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white transition-colors ${
                    currentTheme.id === th.id ? 'font-semibold text-[#0078d4]' : ''
                  }`}
                >
                  <span>{th.label}</span>
                  {currentTheme.id === th.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mock Window Controls */}
        <div className="flex items-center pl-1 space-x-1.5 opacity-60 hover:opacity-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f1fa8c]/50 hover:bg-[#f1fa8c] cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#50fa7b]/50 hover:bg-[#50fa7b] cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
