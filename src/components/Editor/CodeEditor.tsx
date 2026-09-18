import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { DiagnosticItem, EditorSettings, FileNode } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';
import { FileCode, Sparkles, Command, FolderPlus, FilePlus } from 'lucide-react';

interface CodeEditorProps {
  activeFile: FileNode | null;
  currentTheme: VSCodeThemeDefinition;
  settings: EditorSettings;
  diagnostics: DiagnosticItem[];
  onChangeContent: (newContent: string) => void;
  onCursorChange: (line: number, column: number) => void;
  onSave: () => void;
  onNewFile: () => void;
  onOpenCommandPalette: () => void;
  onOpenFilePalette: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  currentTheme,
  settings,
  diagnostics,
  onChangeContent,
  onCursorChange,
  onSave,
  onNewFile,
  onOpenCommandPalette,
  onOpenFilePalette,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Sync Diagnostics / Linting markers into Monaco Editor
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFile) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = diagnostics
      .filter((d) => d.fileId === activeFile.id)
      .map((d) => {
        let severity = monaco.MarkerSeverity.Info;
        if (d.severity === 'error') severity = monaco.MarkerSeverity.Error;
        if (d.severity === 'warning') severity = monaco.MarkerSeverity.Warning;

        return {
          startLineNumber: d.line,
          startColumn: d.column || 1,
          endLineNumber: d.endLine || d.line,
          endColumn: d.endColumn || (d.column ? d.column + 10 : 100),
          message: d.message,
          severity,
          source: d.source,
        };
      });

    monaco.editor.setModelMarkers(model, 'linter', markers);
  }, [diagnostics, activeFile]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set custom VS Code theme rules if needed
    monaco.editor.defineTheme('vscode-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569cd6' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'regexp', foreground: 'd16969' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'class', foreground: '4ec9b0' },
        { token: 'function', foreground: 'dcdcaa' },
        { token: 'variable', foreground: '9cdcfe' },
        { token: 'constant', foreground: '4fc1ff' },
      ],
      colors: {
        'editor.background': currentTheme.ui.editorBg,
        'editor.foreground': currentTheme.ui.editorFg,
        'editorLineNumber.foreground': currentTheme.ui.lineNumbers,
        'editorCursor.foreground': '#aeafad',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });

    // Cursor position listener
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Save keybinding: Ctrl+S or Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Format keybinding: Shift+Alt+F
    editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    );
  };

  // If no file is open, render the authentic VS Code Welcome Screen
  if (!activeFile) {
    return (
      <div
        id="vscode-welcome-screen"
        className="flex-1 h-full flex flex-col items-center justify-center p-8 select-none overflow-y-auto"
        style={{
          backgroundColor: currentTheme.ui.editorBg,
          color: currentTheme.ui.editorFg,
        }}
      >
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3">
            <svg className="w-16 h-16 text-[#007acc]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.27a1 1 0 0 0-.008 1.442L4.62 12 .319 15.288a1 1 0 0 0 .008 1.442l1.322 1.212a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zM18.5 18.257L9.584 12 18.5 5.743v12.514z" />
            </svg>
            <h1 className="text-2xl font-light text-white tracking-wide">
              Visual Studio Code Web
            </h1>
            <p className="text-xs text-[#888888]">
              Editing evolved. High-performance code editor for the web.
            </p>
          </div>

          {/* Quick Start Buttons */}
          <div className="space-y-2 text-left bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-2">
              Start
            </div>
            <button
              onClick={onNewFile}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-[#007acc]/20 text-[#cccccc] hover:text-white transition-colors text-xs"
            >
              <span className="flex items-center gap-2">
                <FilePlus size={14} className="text-[#007acc]" /> New File...
              </span>
              <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                Ctrl+N
              </kbd>
            </button>
            <button
              onClick={onOpenFilePalette}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-[#007acc]/20 text-[#cccccc] hover:text-white transition-colors text-xs"
            >
              <span className="flex items-center gap-2">
                <Command size={14} className="text-emerald-400" /> Open File...
              </span>
              <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                Ctrl+P
              </kbd>
            </button>
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-[#007acc]/20 text-[#cccccc] hover:text-white transition-colors text-xs"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" /> Show All Commands...
              </span>
              <kbd className="text-[10px] opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                Ctrl+Shift+P
              </kbd>
            </button>
          </div>

          {/* Keyboard Shortcuts Table */}
          <div className="text-left text-[11px] text-[#888888] space-y-1.5">
            <div className="flex justify-between py-0.5">
              <span>Show All Commands</span>
              <kbd className="font-mono text-white/70">Ctrl+Shift+P</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Go to File</span>
              <kbd className="font-mono text-white/70">Ctrl+P</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Format Document</span>
              <kbd className="font-mono text-white/70">Shift+Alt+F</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Toggle Side Bar</span>
              <kbd className="font-mono text-white/70">Ctrl+B</kbd>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Toggle Terminal</span>
              <kbd className="font-mono text-white/70">Ctrl+`</kbd>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="monaco-container" className="flex-1 w-full h-full relative overflow-hidden">
      <Editor
        key={activeFile.id}
        height="100%"
        width="100%"
        path={activeFile.path}
        language={activeFile.language || 'plaintext'}
        value={activeFile.content || ''}
        theme={currentTheme.type === 'light' ? 'vs' : 'vs-dark'}
        onChange={(value) => {
          onChangeContent(value || '');
        }}
        onMount={handleEditorDidMount}
        loading={
          <div
            className="flex flex-col items-center justify-center h-full text-xs text-[#888888] space-y-2"
            style={{ backgroundColor: currentTheme.ui.editorBg }}
          >
            <div className="w-5 h-5 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading editor...</span>
          </div>
        }
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          lineNumbers: settings.lineNumbers,
          minimap: { enabled: settings.minimap },
          bracketPairColorization: { enabled: settings.bracketPairColorization },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace",
          fontLigatures: true,
          padding: { top: 8, bottom: 8 },
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          renderLineHighlightOnlyWhenFocus: false,
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'always',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
};
