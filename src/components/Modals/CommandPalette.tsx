import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, FileText, X } from 'lucide-react';
import { FileNode } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';
import { FileIcon } from '../Common/FileIcon';
import { getAllFiles } from '../../services/fileSystem';

interface CommandItem {
  id: string;
  title: string;
  category?: string;
  shortcut?: string;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  initialMode: 'command' | 'file';
  onClose: () => void;
  files: FileNode[];
  onOpenFile: (fileId: string) => void;
  commands: CommandItem[];
  currentTheme: VSCodeThemeDefinition;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  initialMode,
  onClose,
  files,
  onOpenFile,
  commands,
  currentTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialMode === 'command' ? '>' : '');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [isOpen, initialMode, onClose]);

  if (!isOpen) return null;

  const isCommandMode = query.startsWith('>');
  const cleanQuery = isCommandMode ? query.slice(1).trim().toLowerCase() : query.trim().toLowerCase();

  const allFiles = getAllFiles(files);

  let filteredItems: Array<{
    id: string;
    label: string;
    detail?: string;
    shortcut?: string;
    icon: React.ReactNode;
    run: () => void;
  }> = [];

  if (isCommandMode) {
    filteredItems = commands
      .filter((cmd) => {
        const full = `${cmd.category || ''} ${cmd.title}`.toLowerCase();
        return full.includes(cleanQuery);
      })
      .map((cmd) => ({
        id: cmd.id,
        label: cmd.title,
        detail: cmd.category,
        shortcut: cmd.shortcut,
        icon: <Command size={14} className="text-[#007acc] shrink-0" />,
        run: cmd.run,
      }));
  } else {
    filteredItems = allFiles
      .filter((file) => file.name.toLowerCase().includes(cleanQuery) || file.path.toLowerCase().includes(cleanQuery))
      .map((file) => ({
        id: file.id,
        label: file.name,
        detail: file.path,
        icon: <FileIcon filename={file.name} size={14} className="shrink-0" />,
        run: () => onOpenFile(file.id),
      }));
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run();
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        id="vscode-command-palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-md shadow-2xl overflow-hidden border text-[12px] flex flex-col max-h-[420px]"
        style={{
          backgroundColor: currentTheme.ui.sideBarBg,
          borderColor: currentTheme.ui.sideBarBorder,
          color: currentTheme.ui.sideBarFg,
        }}
      >
        {/* Input Bar */}
        <div className="p-2 border-b border-[#3c3c3c] flex items-center gap-2 bg-[#222222]">
          <Search size={14} className="text-[#888888] shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isCommandMode
                ? 'Type a command name to execute...'
                : 'Type file name to open (or prefix > for commands)...'
            }
            className="w-full bg-transparent text-white text-[12px] outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="text-[10px] text-[#888888] bg-black/20 px-1.5 py-0.5 rounded">
              Esc
            </kbd>
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1 divide-y divide-[#2b2b2b]/30">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-[#888888]">
              {isCommandMode ? 'No matching commands found' : 'No matching files found'}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#007acc] text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.icon}
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.detail && (
                        <span
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-white/80' : 'text-[#888888]'
                          }`}
                        >
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-2 ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-[#888888]'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
