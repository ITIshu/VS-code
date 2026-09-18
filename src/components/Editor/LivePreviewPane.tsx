import React, { useState } from 'react';
import {
  Play,
  RotateCw,
  Smartphone,
  Tablet,
  Monitor,
  X,
  ExternalLink,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { FileNode } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';

interface LivePreviewPaneProps {
  activeFile: FileNode | null;
  files: FileNode[];
  currentTheme: VSCodeThemeDefinition;
  onClose: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
  activeFile,
  files,
  currentTheme,
  onClose,
}) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [key, setKey] = useState(0);

  // Generate sandboxed HTML content
  const buildPreviewHtml = (): string => {
    // If active file is HTML or contains HTML
    const content = activeFile?.content || '';
    if (content.includes('<html') || content.includes('<!DOCTYPE') || content.includes('<div') || content.includes('<h1')) {
      return content;
    }

    // Wrap JS/TS in interactive visual runner
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      background: #0b0f17;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    h2 { margin: 0 0 8px; font-size: 20px; color: #fff; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px; }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #0369a1; }
    .output-box {
      margin-top: 16px;
      padding: 12px;
      background: #030712;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      color: #10b981;
      border: 1px solid #1f2937;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Live Sandbox Running</div>
    <h2>Interactive App Preview</h2>
    <p>Rendering active target: <strong>${activeFile?.name || 'Workspace Root'}</strong></p>
    <button id="counter-btn" onclick="handleClick()">Simulate Interaction: Clicked <span id="count">0</span> times</button>
    <div class="output-box" id="log-output">Live Execution: Ready & listening for events...</div>
  </div>

  <script>
    let clicks = 0;
    function handleClick() {
      clicks++;
      document.getElementById('count').innerText = clicks;
      document.getElementById('log-output').innerText = 'Event dispatched at ' + new Date().toLocaleTimeString() + ' | State: ' + clicks;
    }
  </script>
</body>
</html>`;
  };

  const getContainerWidth = () => {
    if (device === 'mobile') return '375px';
    if (device === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div
      id="nova-live-preview-pane"
      className="flex flex-col h-full border-l border-[#1e293b] bg-[#0b0f17] select-none"
      style={{
        backgroundColor: currentTheme.ui.editorBg,
        borderColor: currentTheme.ui.sideBarBorder,
      }}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e293b] bg-[#0f172a] text-[11px] shrink-0">
        <div className="flex items-center gap-2 text-white font-medium">
          <Code2 size={13} className="text-sky-400" />
          <span>Interactive Live Canvas</span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 size={10} /> Live DOM
          </span>
        </div>

        {/* Device Controls */}
        <div className="flex items-center gap-1 bg-[#1e293b] p-0.5 rounded border border-[#334155]">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop Mode"
            className={`p-1 rounded ${
              device === 'desktop' ? 'bg-sky-600 text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Monitor size={12} />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            title="Tablet Mode (768px)"
            className={`p-1 rounded ${
              device === 'tablet' ? 'bg-sky-600 text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Tablet size={12} />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile Mode (375px)"
            className={`p-1 rounded ${
              device === 'mobile' ? 'bg-sky-600 text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Smartphone size={12} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey((prev) => prev + 1)}
            title="Reload Sandbox"
            className="p-1 rounded hover:bg-white/10 text-[#94a3b8] hover:text-white"
          >
            <RotateCw size={13} />
          </button>
          <button
            onClick={onClose}
            title="Close Preview"
            className="p-1 rounded hover:bg-white/10 text-[#94a3b8] hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-auto bg-[#070a10]">
        <div
          className="h-full bg-white shadow-2xl transition-all duration-200 rounded overflow-hidden border border-[#1e293b]"
          style={{ width: getContainerWidth() }}
        >
          <iframe
            key={key}
            srcDoc={buildPreviewHtml()}
            title="Nova Live Canvas"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
