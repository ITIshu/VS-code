import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Columns,
  Play,
  BookOpen,
  Sparkles,
  MoreHorizontal,
  Circle,
} from 'lucide-react';
import { TabItem } from '../../types';
import { FileIcon } from '../Common/FileIcon';
import { VSCodeThemeDefinition } from '../../services/themes';

interface TabBarProps {
  currentTheme: VSCodeThemeDefinition;
  tabs: TabItem[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseOtherTabs: (fileId: string) => void;
  onCloseAllTabs: () => void;
  onCloseRightTabs: (fileId: string) => void;
  onToggleSplit: () => void;
  isSplit: boolean;
  onRunCode: () => void;
  onFormatDocument: () => void;
  isMarkdown: boolean;
  isMarkdownPreviewOpen: boolean;
  onToggleMarkdownPreview: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTheme,
  tabs,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onCloseRightTabs,
  onToggleSplit,
  isSplit,
  onRunCode,
  onFormatDocument,
  isMarkdown,
  isMarkdownPreviewOpen,
  onToggleMarkdownPreview,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
  } | null>(null);

  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClose);
    return () => document.removeEventListener('mousedown', handleClose);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenu({
      fileId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      id="vscode-tab-bar"
      className="flex items-center justify-between h-[35px] border-b select-none z-10 shrink-0"
      style={{
        backgroundColor: currentTheme.ui.tabBarBg,
        borderColor: currentTheme.ui.tabBorder,
      }}
    >
      {/* Tabs Container */}
      <div className="flex items-center h-full overflow-x-auto no-scrollbar flex-1">
        {tabs.map((tab) => {
          const isActive = activeFileId === tab.fileId;
          return (
            <div
              key={tab.fileId}
              onClick={() => onSelectTab(tab.fileId)}
              onContextMenu={(e) => handleContextMenu(e, tab.fileId)}
              className={`group flex items-center h-full px-3 text-[12px] cursor-pointer border-r transition-colors shrink-0 ${
                isActive
                  ? 'text-white border-t-2 font-medium'
                  : 'text-[#969696] hover:text-[#cccccc] hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isActive
                  ? currentTheme.ui.tabActiveBg
                  : currentTheme.ui.tabInactiveBg,
                borderTopColor: isActive ? currentTheme.ui.accent : 'transparent',
                borderRightColor: currentTheme.ui.tabBorder,
                borderBottomColor: currentTheme.ui.tabBorder,
                borderLeftColor: currentTheme.ui.tabBorder,
              }}
            >
              <FileIcon filename={tab.title} size={14} className="mr-1.5 shrink-0" />
              <span className="truncate max-w-[140px]">{tab.title}</span>

              {/* Dirty Indicator / Close Button */}
              <div className="ml-2 w-4 h-4 flex items-center justify-center">
                {tab.isDirty ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white group-hover:hidden" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.fileId);
                      }}
                      className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded hover:bg-white/20 text-[#cccccc] hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.fileId);
                    }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-4 h-4 rounded hover:bg-white/20 text-[#cccccc] hover:text-white transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Action Buttons (Right side of tabs) */}
      <div className="flex items-center px-2 space-x-1 shrink-0 text-[#858585]">
        {/* Markdown Preview Button */}
        {isMarkdown && (
          <button
            onClick={onToggleMarkdownPreview}
            title={isMarkdownPreviewOpen ? 'Close Preview' : 'Open Markdown Preview to Side'}
            className={`p-1 rounded hover:bg-white/10 hover:text-white transition-colors ${
              isMarkdownPreviewOpen ? 'text-[#007acc] bg-white/10' : ''
            }`}
          >
            <BookOpen size={14} />
          </button>
        )}

        {/* Split Editor */}
        <button
          onClick={onToggleSplit}
          title={isSplit ? 'Single Editor View' : 'Split Editor Right (Ctrl+\\)'}
          className={`p-1 rounded hover:bg-white/10 hover:text-white transition-colors ${
            isSplit ? 'text-[#007acc] bg-white/10' : ''
          }`}
        >
          <Columns size={14} />
        </button>

        {/* Run Code */}
        <button
          onClick={onRunCode}
          title="Run Code in Terminal (Code Runner Plugin)"
          className="p-1 rounded hover:bg-white/10 hover:text-emerald-400 text-emerald-500/80 transition-colors"
        >
          <Play size={14} fill="currentColor" />
        </button>

        {/* Format Document */}
        <button
          onClick={onFormatDocument}
          title="Format Document (Prettier) [Shift+Alt+F]"
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Sparkles size={14} />
        </button>
      </div>

      {/* Right-click Context Menu on Tab */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="fixed z-50 w-44 rounded-md shadow-2xl py-1 text-[12px] border backdrop-blur-sm"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: currentTheme.ui.sideBarBg,
            borderColor: currentTheme.ui.sideBarBorder,
            color: currentTheme.ui.sideBarFg,
          }}
        >
          <button
            onClick={() => {
              onCloseTab(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
          >
            Close Tab
          </button>
          <button
            onClick={() => {
              onCloseOtherTabs(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
          >
            Close Other Tabs
          </button>
          <button
            onClick={() => {
              onCloseRightTabs(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
          >
            Close Tabs to the Right
          </button>
          <div className="my-1 border-t opacity-20" />
          <button
            onClick={() => {
              onCloseAllTabs();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#007acc] hover:text-white"
          >
            Close All Tabs
          </button>
        </div>
      )}
    </div>
  );
};
