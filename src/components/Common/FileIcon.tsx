import React from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  FileSpreadsheet,
  FileType,
  File,
  Folder,
  FolderOpen,
} from 'lucide-react';

interface FileIconProps {
  filename: string;
  className?: string;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ filename, className = 'w-4 h-4', size = 16 }) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] text-[#3178c6] select-none ${className}`}>
          TS
        </span>
      );
    case 'tsx':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] text-[#00b4d8] select-none ${className}`}>
          ⚛
        </span>
      );
    case 'js':
    case 'mjs':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] text-[#f7df1e] select-none ${className}`}>
          JS
        </span>
      );
    case 'jsx':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] text-[#61dafb] select-none ${className}`}>
          ⚛
        </span>
      );
    case 'json':
      return <FileJson size={size} className={`text-[#cbcb41] ${className}`} />;
    case 'css':
    case 'scss':
      return <FileType size={size} className={`text-[#42a5f5] ${className}`} />;
    case 'html':
      return <FileCode size={size} className={`text-[#e44d26] ${className}`} />;
    case 'md':
      return <FileText size={size} className={`text-[#519aba] ${className}`} />;
    case 'py':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] text-[#3776ab] select-none ${className}`}>
          Py
        </span>
      );
    case 'svg':
    case 'xml':
      return <FileCode size={size} className={`text-[#ff9800] ${className}`} />;
    case 'sql':
      return <FileSpreadsheet size={size} className={`text-[#e91e63] ${className}`} />;
    default:
      return <File size={size} className={`text-[#888888] ${className}`} />;
  }
};

export const FolderIcon: React.FC<{ isOpen: boolean; className?: string; size?: number }> = ({
  isOpen,
  className = 'w-4 h-4 text-[#dcb67a]',
  size = 16,
}) => {
  if (isOpen) {
    return <FolderOpen size={size} className={className} />;
  }
  return <Folder size={size} className={className} />;
};
