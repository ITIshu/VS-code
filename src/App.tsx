import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePanelView,
  ActiveSideBarView,
  DiagnosticItem,
  EditorSettings,
  FileNode,
  OutputMessage,
  TabItem,
} from './types';
import { VSCodePlugin, StatusBarItemRef } from './types/plugin';
import {
  INITIAL_FILES,
  addNodeToTree,
  deleteNodeFromTree,
  detectLanguage,
  findFileById,
  getAllFiles,
  loadFileSystem,
  markFileSaved,
  renameNodeInTree,
  resetFileSystem,
  saveFileSystem,
  updateFileContent,
} from './services/fileSystem';
import { THEMES, VSCodeThemeDefinition } from './services/themes';
import { pluginManager } from './services/pluginSystem';
import { TitleBar } from './components/TitleBar/TitleBar';
import { ActivityBar } from './components/ActivityBar/ActivityBar';
import { SideBar } from './components/SideBar/SideBar';
import { TabBar } from './components/Editor/TabBar';
import { BreadcrumbBar } from './components/Editor/BreadcrumbBar';
import { CodeEditor } from './components/Editor/CodeEditor';
import { MarkdownPreview } from './components/Editor/MarkdownPreview';
import { DiffViewer } from './components/Editor/DiffViewer';
import { LivePreviewPane } from './components/Editor/LivePreviewPane';
import { BottomPanel } from './components/Panel/BottomPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { CommandPalette } from './components/Modals/CommandPalette';
import { NewPluginModal } from './components/Modals/NewPluginModal';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'nova-studio',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  autoSave: true,
  formatOnSave: false,
  bracketPairColorization: true,
};

export default function App() {
  // File System State
  const [files, setFiles] = useState<FileNode[]>(() => loadFileSystem());
  const [baselineFiles] = useState<FileNode[]>(() => INITIAL_FILES);

  // Tabs & Active File
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      fileId: 'file-index-ts',
      path: '/src/index.ts',
      title: 'index.ts',
      language: 'typescript',
      isDirty: false,
    },
    {
      fileId: 'file-math-ts',
      path: '/src/math.ts',
      title: 'math.ts',
      language: 'typescript',
      isDirty: false,
    },
    {
      fileId: 'file-readme-md',
      path: '/README.md',
      title: 'README.md',
      language: 'markdown',
      isDirty: false,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState<string | null>('file-index-ts');

  // Workbench Layout State
  const [activeSideBarView, setActiveSideBarView] = useState<ActiveSideBarView | null>('explorer');
  const [activePanelView, setActivePanelView] = useState<ActivePanelView>('output');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [isMarkdownPreviewOpen, setIsMarkdownPreviewOpen] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [diffViewFileId, setDiffViewFileId] = useState<string | null>(null);

  // Cursor & Settings
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const currentTheme: VSCodeThemeDefinition = THEMES[settings.theme] || THEMES['dark-modern'];

  // Modals & Notifications
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'command' | 'file'>('file');
  const [newPluginModalOpen, setNewPluginModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: 'info' | 'warning' | 'error' }>
  >([]);

  // Plugin System State
  const [plugins, setPlugins] = useState<VSCodePlugin[]>(() => pluginManager.getPlugins());
  const [statusBarItems, setStatusBarItems] = useState<StatusBarItemRef[]>(() =>
    pluginManager.getStatusBarItems()
  );
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>(() =>
    pluginManager.getAllDiagnostics()
  );
  const [outputLogs, setOutputLogs] = useState<OutputMessage[]>(() =>
    pluginManager.getOutputLogs()
  );

  const activeFile = activeFileId ? findFileById(files, activeFileId) : null;
  const isMarkdown = activeFile?.language === 'markdown';

  // Notification helper
  const showNotification = useCallback(
    (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
      const id = 'notif-' + Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4500);
    },
    []
  );

  // Bind Editor to Plugin Manager
  useEffect(() => {
    pluginManager.bindEditor({
      getActiveFile: () => (activeFileId ? findFileById(files, activeFileId) : null),
      getActiveContent: () => {
        const f = activeFileId ? findFileById(files, activeFileId) : null;
        return f?.content || '';
      },
      setActiveContent: (newContent: string) => {
        if (!activeFileId) return;
        handleContentChange(newContent);
      },
      insertText: (text: string) => {
        if (!activeFileId) return;
        const f = findFileById(files, activeFileId);
        if (!f) return;
        handleContentChange((f.content || '') + text);
      },
      formatDocument: () => {
        handleFormatDocument();
      },
      showNotification,
    });
  }, [files, activeFileId, showNotification]);

  // Subscribe to Plugin System State changes
  useEffect(() => {
    const sub = pluginManager.subscribe(() => {
      setPlugins(pluginManager.getPlugins());
      setStatusBarItems(pluginManager.getStatusBarItems());
      setDiagnostics(pluginManager.getAllDiagnostics());
      setOutputLogs(pluginManager.getOutputLogs());
    });
    return () => sub.dispose();
  }, []);

  // Save files to localStorage on change
  useEffect(() => {
    saveFileSystem(files);
  }, [files]);

  // Handle Tab and File Operations
  const handleOpenFile = (fileId: string) => {
    const file = findFileById(files, fileId);
    if (!file || file.type !== 'file') return;

    setActiveFileId(fileId);
    setDiffViewFileId(null);

    // If tab doesn't exist, append it
    setTabs((prev) => {
      if (prev.some((t) => t.fileId === fileId)) return prev;
      return [
        ...prev,
        {
          fileId: file.id,
          path: file.path,
          title: file.name,
          language: file.language,
          isDirty: file.isDirty || false,
        },
      ];
    });
  };

  const handleCloseTab = (fileId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.fileId !== fileId);
      if (activeFileId === fileId) {
        const nextActive = filtered[filtered.length - 1]?.fileId || null;
        setActiveFileId(nextActive);
      }
      return filtered;
    });
  };

  const handleCloseOtherTabs = (fileId: string) => {
    setTabs((prev) => prev.filter((t) => t.fileId === fileId));
    setActiveFileId(fileId);
  };

  const handleCloseAllTabs = () => {
    setTabs([]);
    setActiveFileId(null);
  };

  const handleCloseRightTabs = (fileId: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.fileId === fileId);
      if (idx === -1) return prev;
      return prev.slice(0, idx + 1);
    });
  };

  const handleContentChange = (newContent: string) => {
    if (!activeFileId) return;
    const { updatedNodes, isDirty } = updateFileContent(files, activeFileId, newContent);
    setFiles(updatedNodes);

    // Update tab dirty state
    setTabs((prev) =>
      prev.map((t) => (t.fileId === activeFileId ? { ...t, isDirty: true } : t))
    );

    const f = findFileById(updatedNodes, activeFileId);
    if (f) {
      pluginManager.triggerContentChange(newContent, f);
    }
  };

  const handleSaveFile = () => {
    if (!activeFileId) return;
    const updated = markFileSaved(files, activeFileId);
    setFiles(updated);
    setTabs((prev) =>
      prev.map((t) => (t.fileId === activeFileId ? { ...t, isDirty: false } : t))
    );

    const f = findFileById(updated, activeFileId);
    if (f) {
      pluginManager.triggerSave(f);
      showNotification(`Saved ${f.name}`, 'info');
    }
  };

  const handleFormatDocument = () => {
    pluginManager.executeCommand('editor.formatDocument');
  };

  const handleRunCode = () => {
    setIsPanelOpen(true);
    setActivePanelView('output');
    pluginManager.executeCommand('code-runner.run');
  };

  // Tree manipulation
  const handleCreateFile = (folderId: string | null, name: string) => {
    const id = 'file-' + Math.random().toString(36).substring(2, 9);
    const parent = folderId ? findFileById(files, folderId) : null;
    const path = parent ? `${parent.path}/${name}` : `/${name}`;
    const language = detectLanguage(name);

    const newFile: FileNode = {
      id,
      name,
      path,
      type: 'file',
      language,
      content: `// ${name}\n\n`,
      isDirty: false,
    };

    const updated = addNodeToTree(files, folderId, newFile);
    setFiles(updated);
    handleOpenFile(id);
    showNotification(`Created file ${name}`, 'info');
  };

  const handleCreateFolder = (folderId: string | null, name: string) => {
    const id = 'folder-' + Math.random().toString(36).substring(2, 9);
    const parent = folderId ? findFileById(files, folderId) : null;
    const path = parent ? `${parent.path}/${name}` : `/${name}`;

    const newFolder: FileNode = {
      id,
      name,
      path,
      type: 'folder',
      language: '',
      isOpen: true,
      children: [],
    };

    const updated = addNodeToTree(files, folderId, newFolder);
    setFiles(updated);
    showNotification(`Created folder ${name}`, 'info');
  };

  const handleRenameNode = (id: string, newName: string) => {
    const updated = renameNodeInTree(files, id, newName);
    setFiles(updated);
    setTabs((prev) =>
      prev.map((t) => (t.fileId === id ? { ...t, title: newName } : t))
    );
    showNotification(`Renamed to ${newName}`, 'info');
  };

  const handleDeleteNode = (id: string) => {
    handleCloseTab(id);
    const updated = deleteNodeFromTree(files, id);
    setFiles(updated);
    showNotification(`Deleted item`, 'info');
  };

  const handleResetWorkspace = () => {
    const initial = resetFileSystem();
    setFiles(initial);
    setTabs([
      {
        fileId: 'file-index-ts',
        path: '/src/index.ts',
        title: 'index.ts',
        language: 'typescript',
        isDirty: false,
      },
    ]);
    setActiveFileId('file-index-ts');
    showNotification(`Workspace reset to defaults`, 'info');
  };

  const handleExportProject = () => {
    const all = getAllFiles(files);
    const projectExport = {
      name: 'vscode-web-workspace',
      exportedAt: new Date().toISOString(),
      files: all.map((f) => ({
        path: f.path,
        name: f.name,
        language: f.language,
        content: f.content,
      })),
    };

    const blob = new Blob([JSON.stringify(projectExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vscode-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Project exported successfully', 'info');
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleCreateFile(null, file.name);
      setTimeout(() => {
        const found = getAllFiles(files).find((f) => f.name === file.name);
        if (found) {
          handleContentChange(content);
        }
      }, 50);
    };
    reader.readAsText(file);
  };

  // Git / Source Control
  const modifiedFiles = getAllFiles(files).filter((f) => f.isDirty);

  const handleCommitGit = (msg: string) => {
    let updated = files;
    modifiedFiles.forEach((f) => {
      updated = markFileSaved(updated, f.id);
    });
    setFiles(updated);
    setTabs((prev) => prev.map((t) => ({ ...t, isDirty: false })));
    showNotification(`[main] Committed "${msg}"`, 'info');
  };

  const handleRevertFile = (fileId: string) => {
    const baseline = findFileById(baselineFiles, fileId);
    if (baseline && baseline.content !== undefined) {
      const { updatedNodes } = updateFileContent(files, fileId, baseline.content);
      const saved = markFileSaved(updatedNodes, fileId);
      setFiles(saved);
      setTabs((prev) =>
        prev.map((t) => (t.fileId === fileId ? { ...t, isDirty: false } : t))
      );
      setDiffViewFileId(null);
      showNotification(`Reverted changes to ${baseline.name}`, 'info');
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes any open modal or palette
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNewPluginModalOpen(false);
      }
      // Ctrl+S / Cmd+S
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      }
      // Ctrl+P / Cmd+P
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCommandPaletteMode('file');
        setCommandPaletteOpen(true);
      }
      // Ctrl+Shift+P / Cmd+Shift+P or F1
      else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') ||
        e.key === 'F1'
      ) {
        e.preventDefault();
        setCommandPaletteMode('command');
        setCommandPaletteOpen(true);
      }
      // Ctrl+B / Cmd+B (Toggle Sidebar)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActiveSideBarView((prev) => (prev ? null : 'explorer'));
      }
      // Ctrl+J / Cmd+J (Toggle Panel)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
      // Ctrl+\ (Toggle Split)
      else if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setIsSplit((prev) => !prev);
      }
      // Shift+Alt+F (Format Document)
      else if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFormatDocument();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, activeFileId]);

  // Commands for the Command Palette
  const availableCommands = [
    {
      id: 'code-runner.run',
      title: 'Run Active File',
      category: 'Run',
      shortcut: 'Ctrl+Alt+N',
      run: handleRunCode,
    },
    {
      id: 'editor.formatDocument',
      title: 'Format Document (Prettier)',
      category: 'Editor',
      shortcut: 'Shift+Alt+F',
      run: handleFormatDocument,
    },
    {
      id: 'workbench.action.toggleSidebar',
      title: 'Toggle Primary Side Bar',
      category: 'View',
      shortcut: 'Ctrl+B',
      run: () => setActiveSideBarView((prev) => (prev ? null : 'explorer')),
    },
    {
      id: 'workbench.action.togglePanel',
      title: 'Toggle Bottom Panel',
      category: 'View',
      shortcut: 'Ctrl+J',
      run: () => setIsPanelOpen((prev) => !prev),
    },
    {
      id: 'workbench.action.splitEditor',
      title: 'Split Editor Right',
      category: 'View',
      shortcut: 'Ctrl+\\',
      run: () => setIsSplit((prev) => !prev),
    },
    {
      id: 'workbench.action.saveFile',
      title: 'Save Active File',
      category: 'File',
      shortcut: 'Ctrl+S',
      run: handleSaveFile,
    },
    {
      id: 'workbench.action.newFile',
      title: 'New File...',
      category: 'File',
      shortcut: 'Ctrl+N',
      run: () => handleCreateFile(null, 'untitled.ts'),
    },
    {
      id: 'workbench.action.newFolder',
      title: 'New Folder...',
      category: 'File',
      run: () => handleCreateFolder(null, 'new_folder'),
    },
    {
      id: 'todo.listAll',
      title: 'TODO: Highlight and List All Comments',
      category: 'TODO',
      run: () => {
        setIsPanelOpen(true);
        setActivePanelView('output');
        pluginManager.executeCommand('todo.listAll');
      },
    },
    {
      id: 'workbench.action.exportProject',
      title: 'Export Workspace Files',
      category: 'File',
      run: handleExportProject,
    },
    {
      id: 'workbench.action.resetWorkspace',
      title: 'Reset Workspace to Defaults',
      category: 'File',
      run: handleResetWorkspace,
    },
    {
      id: 'extensions.createPlugin',
      title: 'Create Custom Extension Plugin...',
      category: 'Extensions',
      run: () => setNewPluginModalOpen(true),
    },
  ];

  return (
    <div
      id="vscode-app-root"
      className="flex flex-col h-screen w-screen select-none overflow-hidden font-sans"
      style={{
        backgroundColor: currentTheme.ui.editorBg,
        color: currentTheme.ui.editorFg,
      }}
    >
      {/* 1. Title Bar */}
      <TitleBar
        currentTheme={currentTheme}
        onSelectTheme={(themeId) => setSettings((s) => ({ ...s, theme: themeId }))}
        activeFileName={activeFile?.name}
        onOpenFilePalette={() => {
          setCommandPaletteMode('file');
          setCommandPaletteOpen(true);
        }}
        onOpenCommandPalette={() => {
          setCommandPaletteMode('command');
          setCommandPaletteOpen(true);
        }}
        onRunCode={handleRunCode}
        onToggleSidebar={() => setActiveSideBarView((prev) => (prev ? null : 'explorer'))}
        onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
        onToggleSplit={() => setIsSplit((prev) => !prev)}
        isSplit={isSplit}
        onSaveActiveFile={handleSaveFile}
        onFormatDocument={handleFormatDocument}
        onNewFile={() => handleCreateFile(null, 'untitled.ts')}
        onNewFolder={() => handleCreateFolder(null, 'new_folder')}
        onResetWorkspace={handleResetWorkspace}
        onDownloadProject={handleExportProject}
        onToggleMarkdownPreview={() => setIsMarkdownPreviewOpen(!isMarkdownPreviewOpen)}
        isMarkdownActive={Boolean(isMarkdown)}
        isMarkdownPreviewOpen={isMarkdownPreviewOpen}
        onToggleLivePreview={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
        isLivePreviewOpen={isLivePreviewOpen}
        onOpenAiAssistant={() => setActiveSideBarView('ai-assistant')}
      />

      {/* 2. Main Workbench Area: Activity Bar + Side Bar + Editor (+ Bottom Panel) */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Activity Bar (Vertical icons on left) */}
        <ActivityBar
          currentTheme={currentTheme}
          activeView={activeSideBarView}
          onSelectView={(view) =>
            setActiveSideBarView((prev) => (prev === view ? null : view))
          }
          modifiedCount={modifiedFiles.length}
          pluginsCount={plugins.filter((p) => p.enabled).length}
          onOpenSettings={() => setActiveSideBarView('settings')}
          onOpenThemePicker={() => {
            setCommandPaletteMode('command');
            setCommandPaletteOpen(true);
          }}
          onToggleTerminal={() => {
            setIsPanelOpen(true);
            setActivePanelView('terminal');
          }}
        />

        {/* Primary Side Bar */}
        <SideBar
          currentTheme={currentTheme}
          activeView={activeSideBarView}
          files={files}
          activeFileId={activeFileId}
          activeFile={activeFile}
          tabs={tabs}
          plugins={plugins}
          settings={settings}
          modifiedFiles={modifiedFiles}
          onOpenFile={handleOpenFile}
          onCloseTab={handleCloseTab}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRenameNode={handleRenameNode}
          onDeleteNode={handleDeleteNode}
          onRefresh={() => setFiles(loadFileSystem())}
          onExport={handleExportProject}
          onImport={handleImportFile}
          onCommit={handleCommitGit}
          onRevertFile={handleRevertFile}
          onOpenDiff={(fileId) => setDiffViewFileId(fileId)}
          onTogglePlugin={(pluginId) => pluginManager.togglePlugin(pluginId)}
          onOpenNewPluginModal={() => setNewPluginModalOpen(true)}
          onDeletePlugin={(pluginId) => pluginManager.unregisterPlugin(pluginId)}
          onRunPluginCommand={(cmdId) => pluginManager.executeCommand(cmdId)}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          onResetWorkspace={handleResetWorkspace}
          onApplyCode={(code) => handleContentChange(code)}
        />

        {/* Editor Area (+ Bottom Panel) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          {/* Top Multi-Tab Bar */}
          <TabBar
            currentTheme={currentTheme}
            tabs={tabs}
            activeFileId={activeFileId}
            onSelectTab={handleOpenFile}
            onCloseTab={handleCloseTab}
            onCloseOtherTabs={handleCloseOtherTabs}
            onCloseAllTabs={handleCloseAllTabs}
            onCloseRightTabs={handleCloseRightTabs}
            onToggleSplit={() => setIsSplit(!isSplit)}
            isSplit={isSplit}
            onRunCode={handleRunCode}
            onFormatDocument={handleFormatDocument}
            isMarkdown={Boolean(isMarkdown)}
            isMarkdownPreviewOpen={isMarkdownPreviewOpen}
            onToggleMarkdownPreview={() => setIsMarkdownPreviewOpen(!isMarkdownPreviewOpen)}
          />

          {/* Breadcrumb Navigation */}
          <BreadcrumbBar
            filePath={activeFile?.path}
            fileName={activeFile?.name}
            currentTheme={currentTheme}
          />

          {/* Central Editor Buffers Area */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden">
            {/* If Diff View is active */}
            {diffViewFileId ? (
              (() => {
                const diffFile = findFileById(files, diffViewFileId);
                const baseFile = findFileById(baselineFiles, diffViewFileId);
                if (!diffFile) return null;
                return (
                  <DiffViewer
                    file={diffFile}
                    originalContent={baseFile?.content || ''}
                    currentContent={diffFile.content || ''}
                    currentTheme={currentTheme}
                    onClose={() => setDiffViewFileId(null)}
                    onRevert={() => handleRevertFile(diffViewFileId)}
                  />
                );
              })()
            ) : (
              <>
                {/* Primary Code Editor */}
                <div className="flex-1 h-full flex min-w-0 relative">
                  <CodeEditor
                    activeFile={activeFile}
                    currentTheme={currentTheme}
                    settings={settings}
                    diagnostics={diagnostics}
                    onChangeContent={handleContentChange}
                    onCursorChange={(line, col) => setCursorPos({ line, col })}
                    onSave={handleSaveFile}
                    onNewFile={() => handleCreateFile(null, 'untitled.ts')}
                    onOpenCommandPalette={() => {
                      setCommandPaletteMode('command');
                      setCommandPaletteOpen(true);
                    }}
                    onOpenFilePalette={() => {
                      setCommandPaletteMode('file');
                      setCommandPaletteOpen(true);
                    }}
                  />
                </div>

                {/* Split Editor (if enabled) */}
                {isSplit && (
                  <div className="flex-1 h-full flex min-w-0 border-l border-[#2b2b2b] relative">
                    <CodeEditor
                      activeFile={activeFile}
                      currentTheme={currentTheme}
                      settings={settings}
                      diagnostics={diagnostics}
                      onChangeContent={handleContentChange}
                      onCursorChange={(line, col) => setCursorPos({ line, col })}
                      onSave={handleSaveFile}
                      onNewFile={() => handleCreateFile(null, 'untitled.ts')}
                      onOpenCommandPalette={() => {
                        setCommandPaletteMode('command');
                        setCommandPaletteOpen(true);
                      }}
                      onOpenFilePalette={() => {
                        setCommandPaletteMode('file');
                        setCommandPaletteOpen(true);
                      }}
                    />
                  </div>
                )}

                {/* Markdown Preview Side-Pane (if open & active file is markdown) */}
                {isMarkdownPreviewOpen && isMarkdown && activeFile && (
                  <MarkdownPreview
                    content={activeFile.content || ''}
                    fileName={activeFile.name}
                    currentTheme={currentTheme}
                    onClose={() => setIsMarkdownPreviewOpen(false)}
                  />
                )}

                {/* Interactive Live Canvas Preview Side-Pane */}
                {isLivePreviewOpen && (
                  <div className="flex-1 h-full flex min-w-0 border-l border-[#1e293b] relative">
                    <LivePreviewPane
                      activeFile={activeFile}
                      files={files}
                      currentTheme={currentTheme}
                      onClose={() => setIsLivePreviewOpen(false)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Panel (Problems, Output, Terminal, Debug Console) */}
          <BottomPanel
            currentTheme={currentTheme}
            isOpen={isPanelOpen}
            activeTab={activePanelView}
            onSelectTab={setActivePanelView}
            onClose={() => setIsPanelOpen(false)}
            diagnostics={diagnostics}
            outputLogs={outputLogs}
            onClearOutput={(ch) => pluginManager.clearOutputLogs(ch)}
            onJumpToDiagnostic={(fId) => handleOpenFile(fId)}
            files={files}
            onRunCode={handleRunCode}
            onSelectTheme={(th) => setSettings((s) => ({ ...s, theme: th }))}
            onCommitGit={handleCommitGit}
            modifiedCount={modifiedFiles.length}
          />
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <StatusBar
        currentTheme={currentTheme}
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        errorCount={diagnostics.filter((d) => d.severity === 'error').length}
        warningCount={diagnostics.filter((d) => d.severity === 'warning').length}
        language={activeFile?.language || 'plaintext'}
        tabSize={settings.tabSize}
        pluginItems={statusBarItems}
        onToggleProblems={() => {
          setIsPanelOpen(true);
          setActivePanelView('problems');
        }}
        onRunPluginCommand={(cmdId) => pluginManager.executeCommand(cmdId)}
        onSelectLanguage={(lang) => {
          if (!activeFileId) return;
          const updated = files.map((f) =>
            f.id === activeFileId ? { ...f, language: lang } : f
          );
          setFiles(updated);
        }}
      />

      {/* 4. Modals & Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        initialMode={commandPaletteMode}
        onClose={() => setCommandPaletteOpen(false)}
        files={files}
        onOpenFile={handleOpenFile}
        commands={availableCommands}
        currentTheme={currentTheme}
      />

      <NewPluginModal
        isOpen={newPluginModalOpen}
        onClose={() => setNewPluginModalOpen(false)}
        onInstallPlugin={(plugin) => {
          pluginManager.registerPlugin(plugin);
          showNotification(`Installed plugin "${plugin.displayName}"`, 'info');
        }}
        currentTheme={currentTheme}
      />

      {/* 5. Floating VS Code Toast Notifications */}
      <div className="fixed bottom-8 right-4 z-50 flex flex-col space-y-2 max-w-sm">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between p-3 rounded shadow-2xl text-[12px] border backdrop-blur-sm transition-all transform animate-in slide-in-from-bottom-2 ${
              n.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/40'
                : n.type === 'warning'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/40'
                : 'bg-[#252526]/95 text-[#cccccc] border-[#3c3c3c]'
            }`}
          >
            <span className="truncate mr-2">{n.message}</span>
            <button
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="text-[#888888] hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
