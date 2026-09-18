import React from 'react';
import { VSCodeThemeDefinition } from '../../services/themes';
import { BookOpen, X } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  fileName: string;
  currentTheme: VSCodeThemeDefinition;
  onClose: () => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  fileName,
  currentTheme,
  onClose,
}) => {
  // Simple clean markdown parser to avoid heavy external dependencies
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-3 my-2 rounded bg-black/40 text-emerald-300 font-mono text-[12px] overflow-x-auto border border-white/10"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3);
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-bold border-b border-white/15 pb-1.5 mt-4 mb-2 text-white">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-semibold border-b border-white/10 pb-1 mt-3 mb-2 text-white">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-semibold mt-2 mb-1 text-white">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Unordered lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().slice(2);
        elements.push(
          <li key={index} className="ml-4 list-disc my-0.5 text-[#cccccc] text-[12px]">
            {itemText}
          </li>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.*)/);
        if (match) {
          elements.push(
            <li key={index} className="ml-4 list-decimal my-0.5 text-[#cccccc] text-[12px]">
              {match[2]}
            </li>
          );
          return;
        }
      }

      // Blank line
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Paragraph
      elements.push(
        <p key={index} className="my-1 text-[#cccccc] text-[12px] leading-relaxed">
          {line}
        </p>
      );
    });

    return elements;
  };

  return (
    <div
      id="vscode-markdown-preview"
      className="flex-1 h-full flex flex-col border-l select-text overflow-hidden"
      style={{
        backgroundColor: currentTheme.ui.editorBg,
        borderColor: currentTheme.ui.sideBarBorder,
        color: currentTheme.ui.editorFg,
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-black/10 text-[11px] select-none">
        <div className="flex items-center gap-1.5 font-medium">
          <BookOpen size={13} className="text-[#007acc]" />
          <span>Preview: {fileName}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-[#cccccc] hover:text-white"
        >
          <X size={13} />
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-y-auto max-w-3xl leading-relaxed">
        {renderMarkdown(content)}
      </div>
    </div>
  );
};
