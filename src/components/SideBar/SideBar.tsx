import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ActiveSideBarView, EditorSettings, FileNode, TabItem } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';
import { ExplorerView } from './ExplorerView';
import { SearchView } from './SearchView';
import { SourceControlView } from './SourceControlView';
import { ExtensionsView } from './ExtensionsView';
import { SettingsView } from './SettingsView';
import { AiAssistantView } from './AiAssistantView';
import { RestClientView } from './RestClientView';
import { CodeRadarView } from './CodeRadarView';
import { VSCodePlugin } from '../../types/plugin';

interface SideBarProps {
  currentTheme: VSCodeThemeDefinition;
  activeView: ActiveSideBarView | null;
  files: FileNode[];
  activeFileId: string | null;
  activeFile: FileNode | null;
  tabs: TabItem[];
  plugins: VSCodePlugin[];
  settings: EditorSettings;
  modifiedFiles: FileNode[];
  onOpenFile: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCreateFile: (folderId: string | null, name: string) => void;
  onCreateFolder: (folderId: string | null, name: string) => void;
  onRenameNode: (id: string, newName: string) => void;
  onDeleteNode: (id: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onCommit: (message: string) => void;
  onRevertFile: (fileId: string) => void;
  onOpenDiff: (fileId: string) => void;
  onTogglePlugin: (pluginId: string) => void;
  onOpenNewPluginModal: () => void;
  onDeletePlugin: (pluginId: string) => void;
  onRunPluginCommand: (cmdId: string) => void;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onResetWorkspace: () => void;
  onApplyCode: (code: string) => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  currentTheme,
  activeView,
  files,
  activeFileId,
  activeFile,
  tabs,
  plugins,
  settings,
  modifiedFiles,
  onOpenFile,
  onCloseTab,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onRefresh,
  onExport,
  onImport,
  onCommit,
  onRevertFile,
  onOpenDiff,
  onTogglePlugin,
  onOpenNewPluginModal,
  onDeletePlugin,
  onRunPluginCommand,
  onUpdateSettings,
  onResetWorkspace,
  onApplyCode,
}) => {
  const [width, setWidth] = useState(260);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      // Account for 48px activity bar on left
      const newWidth = Math.max(180, Math.min(600, e.clientX - 48));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!activeView) return null;

  return (
    <div
      id="vscode-sidebar"
      className="h-full flex flex-col relative shrink-0 border-r z-20"
      style={{
        width: `${width}px`,
        backgroundColor: currentTheme.ui.sideBarBg,
        borderColor: currentTheme.ui.sideBarBorder,
      }}
    >
      {/* Content Area based on active view */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'explorer' && (
          <ExplorerView
            currentTheme={currentTheme}
            files={files}
            activeFileId={activeFileId}
            tabs={tabs}
            onOpenFile={onOpenFile}
            onCloseTab={onCloseTab}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
            onRefresh={onRefresh}
            onExport={onExport}
            onImport={onImport}
          />
        )}
        {activeView === 'ai-assistant' && (
          <AiAssistantView
            currentTheme={currentTheme}
            activeFile={activeFile}
            onApplyCode={onApplyCode}
          />
        )}
        {activeView === 'rest-client' && (
          <RestClientView currentTheme={currentTheme} />
        )}
        {activeView === 'code-radar' && (
          <CodeRadarView currentTheme={currentTheme} files={files} />
        )}
        {activeView === 'search' && (
          <SearchView files={files} onOpenFile={onOpenFile} />
        )}
        {activeView === 'git' && (
          <SourceControlView
            modifiedFiles={modifiedFiles}
            onCommit={onCommit}
            onRevertFile={onRevertFile}
            onOpenDiff={onOpenDiff}
            onOpenFile={onOpenFile}
          />
        )}
        {activeView === 'extensions' && (
          <ExtensionsView
            plugins={plugins}
            onTogglePlugin={onTogglePlugin}
            onOpenNewPluginModal={onOpenNewPluginModal}
            onDeletePlugin={onDeletePlugin}
            onRunPluginCommand={onRunPluginCommand}
          />
        )}
        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onResetWorkspace={onResetWorkspace}
          />
        )}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize hover:bg-[#007acc] transition-colors z-30"
      />
    </div>
  );
};
