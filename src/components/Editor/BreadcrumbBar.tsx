import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FileIcon } from '../Common/FileIcon';
import { VSCodeThemeDefinition } from '../../services/themes';

interface BreadcrumbBarProps {
  filePath?: string;
  fileName?: string;
  currentTheme: VSCodeThemeDefinition;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  filePath,
  fileName,
  currentTheme,
}) => {
  if (!filePath || !fileName) return null;

  const parts = filePath.split('/').filter(Boolean);

  return (
    <div
      id="vscode-breadcrumbs"
      className="flex items-center h-[22px] px-3 text-[11px] border-b select-none shrink-0"
      style={{
        backgroundColor: currentTheme.ui.editorBg,
        borderColor: currentTheme.ui.tabBorder,
        color: currentTheme.ui.editorFg,
        opacity: 0.8,
      }}
    >
      <div className="flex items-center space-x-1 truncate">
        <span className="hover:text-white cursor-pointer opacity-70 hover:opacity-100">
          workspace
        </span>
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight size={12} className="opacity-50 shrink-0" />
              <div className="flex items-center gap-1 hover:text-white cursor-pointer opacity-80 hover:opacity-100">
                {isLast && <FileIcon filename={fileName} size={12} />}
                <span className="truncate">{part}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
