import React, { useState } from 'react';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  Download,
  Upload,
  X,
} from 'lucide-react';
import { FileNode, TabItem } from '../../types';
import { FileIcon, FolderIcon } from '../Common/FileIcon';
import { VSCodeThemeDefinition } from '../../services/themes';

interface ExplorerViewProps {
  currentTheme: VSCodeThemeDefinition;
  files: FileNode[];
  activeFileId: string | null;
  tabs: TabItem[];
  onOpenFile: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCreateFile: (folderId: string | null, name: string) => void;
  onCreateFolder: (folderId: string | null, name: string) => void;
  onRenameNode: (id: string, newName: string) => void;
  onDeleteNode: (id: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  currentTheme,
  files,
  activeFileId,
  tabs,
  onOpenFile,
  onCloseTab,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onRefresh,
  onExport,
  onImport,
}) => {
  const [isOpenEditorsCollapsed, setIsOpenEditorsCollapsed] = useState(false);
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-src': true,
    'folder-plugins': true,
  });

  // Creation State
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null);
  const [newEntryName, setNewEntryName] = useState('');

  // Renaming State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleStartCreate = (type: 'file' | 'folder', folderId: string | null = null) => {
    setCreatingType(type);
    setCreatingInFolder(folderId);
    setNewEntryName(type === 'file' ? 'untitled.ts' : 'new_folder');
    if (folderId) {
      setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
    }
  };

  const handleFinishCreate = () => {
    if (!newEntryName.trim()) {
      setCreatingType(null);
      return;
    }
    if (creatingType === 'file') {
      onCreateFile(creatingInFolder, newEntryName.trim());
    } else if (creatingType === 'folder') {
      onCreateFolder(creatingInFolder, newEntryName.trim());
    }
    setCreatingType(null);
    setNewEntryName('');
  };

  const handleFinishRename = (id: string) => {
    if (renamingName.trim()) {
      onRenameNode(id, renamingName.trim());
    }
    setRenamingId(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  // Recursive Tree Node Renderer
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = expandedFolders[node.id] ?? false;
      const isActive = activeFileId === node.id;
      const isBeingRenamed = renamingId === node.id;

      return (
        <div key={node.id} className="w-full">
          <div
            className={`group flex items-center justify-between py-1 px-2 text-[12px] cursor-pointer hover:bg-white/5 transition-colors ${
              isActive ? 'bg-[#007acc]/20 text-white font-medium' : 'text-[#cccccc]'
            }`}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.id);
              } else {
                onOpenFile(node.id);
              }
            }}
          >
            <div className="flex items-center gap-1.5 truncate flex-1 mr-2">
              {isFolder ? (
                <>
                  <span className="text-[#858585] shrink-0">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <FolderIcon isOpen={isExpanded} size={15} />
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  <FileIcon filename={node.name} size={15} />
                </>
              )}

              {isBeingRenamed ? (
                <input
                  type="text"
                  value={renamingName}
                  autoFocus
                  onChange={(e) => setRenamingName(e.target.value)}
                  onBlur={() => handleFinishRename(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(node.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="bg-[#3c3c3c] text-white px-1 py-0.5 rounded text-[11px] outline-none border border-[#007acc] w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{node.name}</span>
              )}

              {node.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shrink-0" />}
            </div>

            {/* Hover Actions (New child, rename, delete) */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartCreate('file', node.id);
                    }}
                    title="New File Inside"
                    className="p-0.5 hover:bg-white/20 rounded text-[#cccccc]"
                  >
                    <FilePlus size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartCreate('folder', node.id);
                    }}
                    title="New Folder Inside"
                    className="p-0.5 hover:bg-white/20 rounded text-[#cccccc]"
                  >
                    <FolderPlus size={12} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(node.id);
                  setRenamingName(node.name);
                }}
                title="Rename"
                className="p-0.5 hover:bg-white/20 rounded text-[#cccccc]"
              >
                <Edit2 size={11} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${node.name}?`)) {
                    onDeleteNode(node.id);
                  }
                }}
                title="Delete"
                className="p-0.5 hover:bg-red-500/30 text-red-400 rounded"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {/* Creation input if inside this folder */}
          {creatingType && creatingInFolder === node.id && (
            <div
              className="flex items-center py-1 px-2 text-[12px] bg-white/5"
              style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
            >
              {creatingType === 'file' ? <FilePlus size={13} className="mr-1.5 text-sky-400" /> : <FolderPlus size={13} className="mr-1.5 text-amber-400" />}
              <input
                type="text"
                value={newEntryName}
                autoFocus
                onChange={(e) => setNewEntryName(e.target.value)}
                onBlur={handleFinishCreate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishCreate();
                  if (e.key === 'Escape') setCreatingType(null);
                }}
                className="bg-[#3c3c3c] text-white px-1.5 py-0.5 rounded text-[11px] outline-none border border-[#007acc] w-full"
              />
            </div>
          )}

          {/* Folder Children */}
          {isFolder && isExpanded && node.children && renderTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full select-none overflow-y-auto">
      {/* SECTION: OPEN EDITORS */}
      <div className="border-b border-[#2b2b2b]">
        <div
          onClick={() => setIsOpenEditorsCollapsed(!isOpenEditorsCollapsed)}
          className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#888888] cursor-pointer hover:bg-white/5"
        >
          <div className="flex items-center gap-1">
            {isOpenEditorsCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            <span>Open Editors ({tabs.length})</span>
          </div>
        </div>
        {!isOpenEditorsCollapsed && (
          <div className="py-0.5">
            {tabs.map((tab) => (
              <div
                key={tab.fileId}
                onClick={() => onOpenFile(tab.fileId)}
                className={`group flex items-center justify-between px-4 py-1 text-[12px] cursor-pointer hover:bg-white/5 ${
                  activeFileId === tab.fileId ? 'bg-[#007acc]/20 text-white' : 'text-[#cccccc]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileIcon filename={tab.title} size={13} />
                  <span className="truncate">{tab.title}</span>
                  {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shrink-0" />}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.fileId);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded text-[#cccccc]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: WORKSPACE FILES */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#888888] border-b border-[#2b2b2b] bg-black/10">
          <div
            onClick={() => setIsWorkspaceCollapsed(!isWorkspaceCollapsed)}
            className="flex items-center gap-1 cursor-pointer hover:text-white"
          >
            {isWorkspaceCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            <span>Workspace</span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartCreate('file', null)}
              title="New File in Root"
              className="p-1 hover:bg-white/15 rounded text-[#cccccc] hover:text-white transition-colors"
            >
              <FilePlus size={13} />
            </button>
            <button
              onClick={() => handleStartCreate('folder', null)}
              title="New Folder in Root"
              className="p-1 hover:bg-white/15 rounded text-[#cccccc] hover:text-white transition-colors"
            >
              <FolderPlus size={13} />
            </button>
            <button
              onClick={onRefresh}
              title="Refresh Explorer"
              className="p-1 hover:bg-white/15 rounded text-[#cccccc] hover:text-white transition-colors"
            >
              <RefreshCw size={13} />
            </button>
            <label
              title="Import File"
              className="p-1 hover:bg-white/15 rounded text-[#cccccc] hover:text-white transition-colors cursor-pointer"
            >
              <Upload size={13} />
              <input type="file" className="hidden" onChange={handleFileInputChange} />
            </label>
            <button
              onClick={onExport}
              title="Export Project"
              className="p-1 hover:bg-white/15 rounded text-[#cccccc] hover:text-white transition-colors"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {!isWorkspaceCollapsed && (
          <div className="flex-1 overflow-y-auto py-1">
            {/* Root Creation Input */}
            {creatingType && creatingInFolder === null && (
              <div className="flex items-center py-1 px-4 text-[12px] bg-white/5">
                {creatingType === 'file' ? <FilePlus size={13} className="mr-1.5 text-sky-400" /> : <FolderPlus size={13} className="mr-1.5 text-amber-400" />}
                <input
                  type="text"
                  value={newEntryName}
                  autoFocus
                  onChange={(e) => setNewEntryName(e.target.value)}
                  onBlur={handleFinishCreate}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishCreate();
                    if (e.key === 'Escape') setCreatingType(null);
                  }}
                  className="bg-[#3c3c3c] text-white px-1.5 py-0.5 rounded text-[11px] outline-none border border-[#007acc] w-full"
                />
              </div>
            )}

            {renderTree(files)}
          </div>
        )}
      </div>
    </div>
  );
};
