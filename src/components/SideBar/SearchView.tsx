import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Replace, CaseSensitive, WholeWord, Regex } from 'lucide-react';
import { FileNode } from '../../types';
import { FileIcon } from '../Common/FileIcon';
import { getAllFiles } from '../../services/fileSystem';

interface SearchViewProps {
  files: FileNode[];
  onOpenFile: (fileId: string) => void;
  onReplaceAll?: (query: string, replaceText: string) => void;
}

interface MatchResult {
  file: FileNode;
  matches: Array<{ line: number; text: string; col: number }>;
}

export const SearchView: React.FC<SearchViewProps> = ({ files, onOpenFile, onReplaceAll }) => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  const allFiles = getAllFiles(files);

  const results: MatchResult[] = [];
  if (query.trim()) {
    allFiles.forEach((file) => {
      if (!file.content) return;
      const lines = file.content.split('\n');
      const fileMatches: Array<{ line: number; text: string; col: number }> = [];

      try {
        let pattern: RegExp;
        if (useRegex) {
          pattern = new RegExp(query, matchCase ? 'g' : 'gi');
        } else {
          const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const finalPattern = wholeWord ? `\\b${escaped}\\b` : escaped;
          pattern = new RegExp(finalPattern, matchCase ? 'g' : 'gi');
        }

        lines.forEach((lineText, idx) => {
          if (pattern.test(lineText)) {
            fileMatches.push({
              line: idx + 1,
              text: lineText.trim(),
              col: lineText.indexOf(query),
            });
          }
        });
      } catch (e) {
        // Invalid regex
      }

      if (fileMatches.length > 0) {
        results.push({ file, matches: fileMatches });
      }
    });
  }

  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="flex flex-col h-full select-none text-[12px]">
      <div className="p-3 border-b border-[#2b2b2b] space-y-2">
        {/* Search Input Box */}
        <div className="relative flex items-center bg-[#222222] border border-[#3c3c3c] rounded focus-within:border-[#007acc] px-2 py-1">
          <input
            type="text"
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white text-[12px] outline-none w-full pr-16"
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            <button
              onClick={() => setMatchCase(!matchCase)}
              title="Match Case (Alt+C)"
              className={`p-0.5 rounded text-[10px] ${
                matchCase ? 'bg-[#007acc] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              <CaseSensitive size={13} />
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              title="Match Whole Word (Alt+W)"
              className={`p-0.5 rounded text-[10px] ${
                wholeWord ? 'bg-[#007acc] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              <WholeWord size={13} />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              title="Use Regular Expression (Alt+R)"
              className={`p-0.5 rounded text-[10px] ${
                useRegex ? 'bg-[#007acc] text-white' : 'text-[#888888] hover:text-white'
              }`}
            >
              <Regex size={13} />
            </button>
          </div>
        </div>

        {/* Replace Toggle & Input */}
        <div>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="flex items-center gap-1 text-[11px] text-[#888888] hover:text-white mb-1"
          >
            {showReplace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Replace</span>
          </button>

          {showReplace && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="bg-[#222222] border border-[#3c3c3c] rounded text-white text-[12px] outline-none px-2 py-1 flex-1 focus:border-[#007acc]"
              />
              <button
                onClick={() => onReplaceAll && onReplaceAll(query, replaceText)}
                title="Replace All"
                className="px-2 py-1 bg-[#007acc] text-white rounded text-[11px] hover:bg-[#007acc]/80 transition-colors"
              >
                <Replace size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Results summary */}
        {query.trim() && (
          <div className="text-[11px] text-[#888888]">
            {totalMatches} results in {results.length} files
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto py-1">
        {results.map(({ file, matches }) => {
          const isCollapsed = collapsedFiles[file.id];
          return (
            <div key={file.id} className="w-full">
              <div
                onClick={() =>
                  setCollapsedFiles((prev) => ({ ...prev, [file.id]: !prev[file.id] }))
                }
                className="flex items-center justify-between px-3 py-1 bg-white/5 hover:bg-white/10 cursor-pointer text-[12px] font-medium"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[#888888]">
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </span>
                  <FileIcon filename={file.name} size={14} />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full text-[#888888]">
                  {matches.length}
                </span>
              </div>

              {!isCollapsed && (
                <div>
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenFile(file.id)}
                      className="flex items-center gap-2 pl-7 pr-3 py-1 hover:bg-[#007acc]/20 cursor-pointer text-[11px] text-[#cccccc] transition-colors"
                    >
                      <span className="text-[#888888] font-mono shrink-0">Line {m.line}:</span>
                      <span className="truncate font-mono">{m.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
