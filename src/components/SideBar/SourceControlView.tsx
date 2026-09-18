import React, { useState } from 'react';
import { GitCommit, Check, RotateCcw, GitBranch, Split } from 'lucide-react';
import { FileNode } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface SourceControlViewProps {
  modifiedFiles: FileNode[];
  onCommit: (message: string) => void;
  onRevertFile: (fileId: string) => void;
  onOpenDiff: (fileId: string) => void;
  onOpenFile: (fileId: string) => void;
}

export const SourceControlView: React.FC<SourceControlViewProps> = ({
  modifiedFiles,
  onCommit,
  onRevertFile,
  onOpenDiff,
  onOpenFile,
}) => {
  const [commitMessage, setCommitMessage] = useState('');

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    onCommit(commitMessage.trim());
    setCommitMessage('');
  };

  return (
    <div className="flex flex-col h-full select-none text-[12px]">
      <div className="p-3 border-b border-[#2b2b2b] space-y-2.5">
        <div className="flex items-center justify-between text-[#888888]">
          <div className="flex items-center gap-1 font-medium">
            <GitBranch size={13} />
            <span>Branch: <strong className="text-white">main</strong></span>
          </div>
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
            {modifiedFiles.length} changed
          </span>
        </div>

        {/* Commit Input */}
        <div className="space-y-1.5">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Message (Ctrl+Enter to commit)"
            rows={2}
            className="w-full bg-[#222222] border border-[#3c3c3c] rounded p-2 text-white text-[12px] outline-none focus:border-[#007acc] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleCommit();
              }
            }}
          />
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || modifiedFiles.length === 0}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#007acc] hover:bg-[#007acc]/90 disabled:opacity-40 text-white rounded text-[12px] font-medium transition-colors"
          >
            <Check size={14} />
            <span>Commit to main</span>
          </button>
        </div>
      </div>

      {/* Changes Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#888888] bg-black/10 flex items-center justify-between">
          <span>Changes ({modifiedFiles.length})</span>
        </div>

        {modifiedFiles.length === 0 ? (
          <div className="p-6 text-center text-[#888888] space-y-2">
            <GitCommit size={28} className="mx-auto opacity-40" />
            <p className="text-[12px]">No pending changes detected.</p>
            <p className="text-[11px] opacity-70">Edit any file in the workspace to see Git changes here.</p>
          </div>
        ) : (
          <div className="py-1">
            {modifiedFiles.map((file) => (
              <div
                key={file.id}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-white/5 cursor-pointer text-[12px]"
                onClick={() => onOpenFile(file.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileIcon filename={file.name} size={14} />
                  <span className="truncate text-[#cccccc] group-hover:text-white">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#888888] truncate">{file.path}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDiff(file.id);
                    }}
                    title="Open Changes Diff"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-[#cccccc]"
                  >
                    <Split size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Discard changes to ${file.name}?`)) {
                        onRevertFile(file.id);
                      }
                    }}
                    title="Discard Changes"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-[#cccccc]"
                  >
                    <RotateCcw size={12} />
                  </button>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded ml-1">
                    M
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
