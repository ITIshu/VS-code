import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Terminal as TerminalIcon,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { ActivePanelView, DiagnosticItem, FileNode, OutputMessage } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';
import { FileIcon } from '../Common/FileIcon';
import { getAllFiles } from '../../services/fileSystem';

interface BottomPanelProps {
  currentTheme: VSCodeThemeDefinition;
  isOpen: boolean;
  activeTab: ActivePanelView;
  onSelectTab: (tab: ActivePanelView) => void;
  onClose: () => void;
  diagnostics: DiagnosticItem[];
  outputLogs: OutputMessage[];
  onClearOutput: (channel?: string) => void;
  onJumpToDiagnostic: (fileId: string, line: number, col: number) => void;
  files: FileNode[];
  onRunCode: () => void;
  onSelectTheme: (themeId: string) => void;
  onCommitGit: (msg: string) => void;
  modifiedCount: number;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  currentTheme,
  isOpen,
  activeTab,
  onSelectTab,
  onClose,
  diagnostics,
  outputLogs,
  onClearOutput,
  onJumpToDiagnostic,
  files,
  onRunCode,
  onSelectTheme,
  onCommitGit,
  modifiedCount,
}) => {
  const [height, setHeight] = useState(220);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const isDraggingRef = useRef(false);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type?: 'cmd' | 'output' | 'error' | 'success' }>>([
    { text: 'Visual Studio Code Web Terminal [Version 1.90.0]', type: 'output' },
    { text: 'Type "help" to view available web shell commands.', type: 'output' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Debug Console state
  const [debugLogs, setDebugLogs] = useState<Array<{ expr: string; result: string; isError?: boolean }>>([
    { expr: 'Math.PI * 2', result: String(Math.PI * 2) },
  ]);
  const [debugInput, setDebugInput] = useState('');

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newHeight = Math.max(120, Math.min(600, window.innerHeight - e.clientY - 22)); // minus status bar
      setHeight(newHeight);
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

  // Scroll to bottom on new terminal line
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeTab]);

  if (!isOpen) return null;

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  const channels = ['All', 'Code Runner', 'Prettier', 'ESLint', 'TODO Highlighter', 'Extensions'];

  const filteredLogs =
    selectedChannel === 'All'
      ? outputLogs
      : outputLogs.filter((log) => log.channel === selectedChannel);

  // Execute terminal command
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newEntries = [...terminalHistory, { text: `user@vscode-web:~/workspace$ ${cmd}`, type: 'cmd' as const }];
    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch (mainCmd) {
      case 'help':
        newEntries.push({
          text: `Available commands:
  ls                  List files and folders
  cat <file>          Print contents of a file
  node / run <file>   Execute code in the Code Runner
  clear               Clear the terminal screen
  echo <text>         Display line of text
  git status          Show modified working tree files
  git commit -m "msg" Commit changes to main branch
  theme <name>        Change theme (dark-modern, dark-plus, monokai, light-modern)
  whoami              Print current user
  date                Show system date and time`,
          type: 'output',
        });
        break;

      case 'ls':
        const all = getAllFiles(files);
        const listing = all.map((f) => f.path.replace(/^\//, '')).join('   ');
        newEntries.push({ text: listing, type: 'output' });
        break;

      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;

      case 'echo':
        newEntries.push({ text: arg, type: 'output' });
        break;

      case 'whoami':
        newEntries.push({ text: 'developer (VS Code Web)', type: 'output' });
        break;

      case 'date':
        newEntries.push({ text: new Date().toString(), type: 'output' });
        break;

      case 'git':
        if (arg === 'status') {
          newEntries.push({
            text: `On branch main\nChanges not staged for commit: ${modifiedCount} file(s) modified.`,
            type: modifiedCount > 0 ? 'output' : 'success',
          });
        } else if (arg.startsWith('commit')) {
          const match = arg.match(/-m\s+["'](.*?)["']/);
          const commitMsg = match ? match[1] : 'Update from terminal';
          onCommitGit(commitMsg);
          newEntries.push({
            text: `[main ${Math.random().toString(16).substring(2, 8)}] ${commitMsg}\n ${modifiedCount} files changed.`,
            type: 'success',
          });
        } else {
          newEntries.push({ text: `git: "${arg}" is not supported in simulator. Try "git status" or 'git commit -m "message"'.`, type: 'error' });
        }
        break;

      case 'theme':
        if (arg) {
          onSelectTheme(arg);
          newEntries.push({ text: `Theme switched to: ${arg}`, type: 'success' });
        } else {
          newEntries.push({ text: 'Usage: theme <dark-modern | dark-plus | monokai | one-dark-pro | light-modern>', type: 'output' });
        }
        break;

      case 'node':
      case 'run':
        onRunCode();
        newEntries.push({ text: `Triggered code runner for active buffer. Check Output tab for details.`, type: 'success' });
        break;

      case 'cat':
        if (!arg) {
          newEntries.push({ text: 'cat: missing filename', type: 'error' });
        } else {
          const allF = getAllFiles(files);
          const found = allF.find((f) => f.name === arg || f.path === arg || f.path.endsWith(arg));
          if (found && found.content) {
            newEntries.push({ text: found.content, type: 'output' });
          } else {
            newEntries.push({ text: `cat: ${arg}: No such file`, type: 'error' });
          }
        }
        break;

      default:
        newEntries.push({ text: `bash: ${mainCmd}: command not found. Type "help" for a list of commands.`, type: 'error' });
        break;
    }

    setTerminalHistory(newEntries);
    setTerminalInput('');
  };

  // Evaluate in Debug Console
  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugInput.trim()) return;

    try {
      // eslint-disable-next-line no-eval
      const result = window.eval(debugInput);
      setDebugLogs((prev) => [
        ...prev,
        {
          expr: debugInput,
          result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
        },
      ]);
    } catch (err: any) {
      setDebugLogs((prev) => [
        ...prev,
        { expr: debugInput, result: err?.message || String(err), isError: true },
      ]);
    }
    setDebugInput('');
  };

  return (
    <div
      id="vscode-bottom-panel"
      className="relative flex flex-col border-t select-none shrink-0 z-20"
      style={{
        height: isMaximized ? 'calc(100vh - 56px)' : `${height}px`,
        backgroundColor: currentTheme.ui.panelBg,
        borderColor: currentTheme.ui.panelBorder,
        color: currentTheme.ui.editorFg,
      }}
    >
      {/* Top Resize Drag Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute -top-[3px] left-0 right-0 h-[4px] cursor-row-resize hover:bg-[#007acc] transition-colors z-30"
        />
      )}

      {/* Panel Tab Header */}
      <div className="flex items-center justify-between px-3 h-[32px] border-b border-[#2b2b2b] bg-black/10 shrink-0 text-[11px]">
        {/* Left: Tab Buttons */}
        <div className="flex items-center space-x-4">
          {/* Problems */}
          <button
            onClick={() => onSelectTab('problems')}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'problems'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <span>Problems</span>
            <div className="flex items-center gap-1 text-[10px]">
              {errorCount > 0 && (
                <span className="flex items-center text-red-400">
                  <AlertCircle size={11} className="mr-0.5" />
                  {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center text-amber-400">
                  <AlertTriangle size={11} className="mr-0.5" />
                  {warningCount}
                </span>
              )}
            </div>
          </button>

          {/* Output */}
          <button
            onClick={() => onSelectTab('output')}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'output'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <span>Output</span>
          </button>

          {/* Terminal */}
          <button
            onClick={() => onSelectTab('terminal')}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'terminal'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <TerminalIcon size={12} />
            <span>Terminal</span>
          </button>

          {/* Debug Console */}
          <button
            onClick={() => onSelectTab('debug')}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'debug'
                ? 'border-[#007acc] text-white'
                : 'border-transparent text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <span>Debug Console</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 text-[#888888]">
          {/* Output Channel selector if on Output */}
          {activeTab === 'output' && (
            <div className="flex items-center gap-1">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="bg-[#222222] border border-[#3c3c3c] text-white text-[11px] rounded px-2 py-0.5 outline-none"
              >
                {channels.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onClearOutput(selectedChannel)}
                title="Clear Output"
                className="p-1 hover:bg-white/10 hover:text-white rounded"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {/* Clear Terminal if on Terminal */}
          {activeTab === 'terminal' && (
            <button
              onClick={() => setTerminalHistory([])}
              title="Clear Terminal"
              className="p-1 hover:bg-white/10 hover:text-white rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore Panel Size' : 'Maximize Panel Size'}
            className="p-1 hover:bg-white/10 hover:text-white rounded"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1 hover:bg-white/10 hover:text-white rounded"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Panel Content Body */}
      <div className="flex-1 overflow-y-auto font-mono text-[12px] p-2">
        {/* Problems View */}
        {activeTab === 'problems' && (
          <div className="space-y-1">
            {diagnostics.length === 0 ? (
              <div className="flex items-center gap-2 p-4 text-[#888888]">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>No problems have been detected in the workspace.</span>
              </div>
            ) : (
              diagnostics.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onJumpToDiagnostic(d.fileId, d.line, d.column)}
                  className="flex items-start gap-2 px-2 py-1 hover:bg-white/5 cursor-pointer rounded transition-colors text-[12px]"
                >
                  {d.severity === 'error' ? (
                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 truncate">
                    <span className="text-[#cccccc]">{d.message}</span>
                    <span className="text-[#888888] ml-2 text-[11px]">
                      [{d.source}] ({d.fileName}:{d.line}:{d.column})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Output View */}
        {activeTab === 'output' && (
          <div className="space-y-0.5 leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-[#888888]">
                No output logs for channel "{selectedChannel}".
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-0.5 font-mono text-[11.5px]">
                  <span className="text-[#666666] shrink-0">[{log.timestamp}]</span>
                  <span className="text-[#007acc] shrink-0">[{log.channel}]</span>
                  <span
                    className={`whitespace-pre-wrap ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'info'
                        ? 'text-sky-300'
                        : 'text-[#cccccc]'
                    }`}
                  >
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Interactive Terminal View */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full font-mono text-[12px]">
            <div className="flex-1 space-y-1">
              {terminalHistory.map((item, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap ${
                    item.type === 'cmd'
                      ? 'text-white font-bold'
                      : item.type === 'error'
                      ? 'text-red-400'
                      : item.type === 'success'
                      ? 'text-emerald-400'
                      : 'text-[#aaaaaa]'
                  }`}
                >
                  {item.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal CLI prompt input */}
            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-emerald-400 font-bold shrink-0">user@vscode-web:~/workspace$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-white outline-none font-mono text-[12px]"
                placeholder="type command (e.g. ls, help, run, git status)..."
              />
            </form>
          </div>
        )}

        {/* Debug Console View */}
        {activeTab === 'debug' && (
          <div className="flex flex-col h-full font-mono text-[12px]">
            <div className="flex-1 space-y-2 overflow-y-auto">
              {debugLogs.map((log, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="text-sky-400">› {log.expr}</div>
                  <div
                    className={`pl-3 whitespace-pre-wrap ${
                      log.isError ? 'text-red-400' : 'text-emerald-300'
                    }`}
                  >
                    {log.result}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleDebugSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[#007acc] font-bold">›</span>
              <input
                type="text"
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                placeholder="Evaluate JavaScript expression..."
                className="flex-1 bg-transparent text-white outline-none font-mono text-[12px]"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
