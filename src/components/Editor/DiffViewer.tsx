import React from 'react';
import { VSCodeThemeDefinition } from '../../services/themes';
import { X, Split, Check } from 'lucide-react';
import { FileNode } from '../../types';

interface DiffViewerProps {
  file: FileNode;
  originalContent: string;
  currentContent: string;
  currentTheme: VSCodeThemeDefinition;
  onClose: () => void;
  onRevert: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  file,
  originalContent,
  currentContent,
  currentTheme,
  onClose,
  onRevert,
}) => {
  const origLines = originalContent.split('\n');
  const currLines = currentContent.split('\n');
  const maxLines = Math.max(origLines.length, currLines.length);

  return (
    <div
      id="vscode-diff-viewer"
      className="flex-1 h-full flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: currentTheme.ui.editorBg,
        color: currentTheme.ui.editorFg,
      }}
    >
      {/* Diff Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2b2b2b] bg-black/10 text-[11px]">
        <div className="flex items-center gap-2">
          <Split size={13} className="text-amber-400" />
          <span className="font-medium text-white">{file.name}</span>
          <span className="text-[#888888]">(Working Tree Diff)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRevert}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#cccccc] hover:text-white text-[11px]"
          >
            Revert Changes
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-[#cccccc] hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Side-by-Side Diff Columns */}
      <div className="flex-1 flex overflow-y-auto text-[12px] font-mono">
        {/* Original Column */}
        <div className="flex-1 border-r border-[#2b2b2b] overflow-x-auto">
          <div className="sticky top-0 bg-[#252526] px-3 py-1 text-[11px] font-bold text-[#888888] border-b border-[#2b2b2b]">
            Baseline (Original)
          </div>
          <div className="py-1">
            {Array.from({ length: maxLines }).map((_, i) => {
              const orig = origLines[i] ?? '';
              const curr = currLines[i] ?? '';
              const isDiff = orig !== curr;
              return (
                <div
                  key={i}
                  className={`flex items-center px-2 py-0.5 ${
                    isDiff && orig ? 'bg-red-950/40 text-red-200' : 'text-[#888888]'
                  }`}
                >
                  <span className="w-8 text-right pr-3 opacity-40 select-none text-[10px]">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre font-mono">{orig}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Column */}
        <div className="flex-1 overflow-x-auto">
          <div className="sticky top-0 bg-[#252526] px-3 py-1 text-[11px] font-bold text-[#888888] border-b border-[#2b2b2b]">
            Working Tree (Modified)
          </div>
          <div className="py-1">
            {Array.from({ length: maxLines }).map((_, i) => {
              const orig = origLines[i] ?? '';
              const curr = currLines[i] ?? '';
              const isDiff = orig !== curr;
              return (
                <div
                  key={i}
                  className={`flex items-center px-2 py-0.5 ${
                    isDiff && curr ? 'bg-emerald-950/40 text-emerald-200' : 'text-[#cccccc]'
                  }`}
                >
                  <span className="w-8 text-right pr-3 opacity-40 select-none text-[10px]">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre font-mono">{curr}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
