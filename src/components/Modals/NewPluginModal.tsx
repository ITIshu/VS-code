import React, { useState, useEffect } from 'react';
import { X, Code2, Play, Sparkles, Check, HelpCircle } from 'lucide-react';
import { VSCodePlugin } from '../../types/plugin';
import { VSCodeThemeDefinition } from '../../services/themes';

interface NewPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPlugin: (plugin: VSCodePlugin) => void;
  currentTheme: VSCodeThemeDefinition;
}

const DEFAULT_PLUGIN_TEMPLATE = `// Custom VS Code Plugin
// The activate function receives the PluginContext API
export function activate(context) {
  context.output.appendLine('Extensions', 'My Custom Plugin activated successfully!', 'success');

  // 1. Register a custom command
  context.commands.registerCommand('custom.hello', () => {
    context.notifications.show('Hello from your custom plugin!', 'info');
    context.editor.insertText('// Hello World from Custom Plugin!\\n');
  });

  // 2. Add item to bottom status bar
  context.statusBar.createItem('custom-item', {
    text: '★ Custom Plugin',
    tooltip: 'Click to run custom command',
    command: 'custom.hello',
    alignment: 'right'
  });

  // 3. Optional: Listen to editor content changes
  context.editor.onContentChange((content, file) => {
    // Custom analyzer logic here
  });
}
`;

export const NewPluginModal: React.FC<NewPluginModalProps> = ({
  isOpen,
  onClose,
  onInstallPlugin,
  currentTheme,
}) => {
  const [name, setName] = useState('my-extension');
  const [displayName, setDisplayName] = useState('My Custom Extension');
  const [description, setDescription] = useState('A custom plugin created directly in VS Code Web.');
  const [category, setCategory] = useState<'Tools' | 'Formatters' | 'Linters' | 'Preview'>('Tools');
  const [code, setCode] = useState(DEFAULT_PLUGIN_TEMPLATE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstall = () => {
    setError(null);
    try {
      // Evaluate plugin activate function safely
      // Wrap code in a function body returning exports
      const wrappedCode = `
        const exports = {};
        ${code}
        return exports.activate || activate;
      `;
      // eslint-disable-next-line no-new-func
      const activateFn = new Function(wrappedCode)();

      if (typeof activateFn !== 'function') {
        throw new Error('Plugin code must export an activate(context) function!');
      }

      const newPlugin: VSCodePlugin = {
        id: `custom.${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: name.trim(),
        displayName: displayName.trim(),
        version: '1.0.0',
        publisher: 'Local Developer',
        description: description.trim(),
        category,
        enabled: true,
        installed: true,
        builtIn: false,
        customCode: code,
        activate: activateFn,
        contributes: {
          commands: [
            {
              id: `custom.${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.run`,
              title: `${displayName}: Run Command`,
              category: displayName,
              handler: () => {},
            },
          ],
        },
      };

      onInstallPlugin(newPlugin);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error compiling plugin code.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="new-plugin-studio-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-lg shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden"
        style={{
          backgroundColor: currentTheme.ui.sideBarBg,
          borderColor: currentTheme.ui.sideBarBorder,
          color: currentTheme.ui.sideBarFg,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2b2b2b] bg-black/20">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-[#007acc]" />
            <h2 className="text-sm font-semibold text-white">Create Custom Plugin Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-[#888888] hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[12px]">
          {error && (
            <div className="p-2.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#222222] border border-[#3c3c3c] rounded px-2 py-1 text-white outline-none focus:border-[#007acc]"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#222222] border border-[#3c3c3c] rounded px-2 py-1 text-white outline-none focus:border-[#007acc]"
              >
                <option value="Tools">Tools</option>
                <option value="Formatters">Formatters</option>
                <option value="Linters">Linters</option>
                <option value="Preview">Preview</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#222222] border border-[#3c3c3c] rounded px-2 py-1 text-white outline-none focus:border-[#007acc]"
            />
          </div>

          {/* Plugin Script Editor */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-white font-medium">
                Plugin Lifecycle Script (<code className="text-sky-400 font-mono">activate(context)</code>)
              </label>
              <span className="text-[10px] text-[#888888]">PluginContext API available</span>
            </div>
            <textarea
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full font-mono text-[11.5px] bg-[#1a1a1a] border border-[#3c3c3c] rounded p-3 text-emerald-300 outline-none focus:border-[#007acc] leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#2b2b2b] bg-black/20">
          <div className="flex items-center gap-1 text-[11px] text-[#888888]">
            <HelpCircle size={13} />
            <span>Plugin will immediately install and activate in the workbench.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded hover:bg-white/10 text-[#cccccc] text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#007acc] hover:bg-[#007acc]/90 text-white font-medium text-xs transition-colors"
            >
              <Play size={12} />
              <span>Test & Install Plugin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
