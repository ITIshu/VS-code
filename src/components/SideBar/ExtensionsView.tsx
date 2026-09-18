import React, { useState } from 'react';
import {
  Search,
  Plus,
  Star,
  Download,
  Check,
  Settings,
  Code2,
  Trash2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VSCodePlugin } from '../../types/plugin';

interface ExtensionsViewProps {
  plugins: VSCodePlugin[];
  onTogglePlugin: (pluginId: string) => void;
  onOpenNewPluginModal: () => void;
  onDeletePlugin: (pluginId: string) => void;
  onRunPluginCommand: (cmdId: string) => void;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({
  plugins,
  onTogglePlugin,
  onOpenNewPluginModal,
  onDeletePlugin,
  onRunPluginCommand,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Formatters', 'Linters', 'Tools', 'Preview'];

  const filtered = plugins.filter((p) => {
    const matchesSearch =
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.publisher.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full select-none text-[12px]">
      {/* Search & Actions Header */}
      <div className="p-3 border-b border-[#2b2b2b] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
            Extensions Marketplace
          </span>
          <button
            id="create-new-plugin-btn"
            onClick={onOpenNewPluginModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#007acc] hover:bg-[#007acc]/90 text-white text-[11px] font-medium transition-colors"
          >
            <Plus size={12} />
            <span>Create Plugin</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex items-center bg-[#222222] border border-[#3c3c3c] rounded px-2 py-1 focus-within:border-[#007acc]">
          <Search size={13} className="text-[#888888] mr-1.5 shrink-0" />
          <input
            type="text"
            placeholder="Search extensions in Marketplace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-[12px] outline-none w-full"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#007acc] text-white font-medium'
                  : 'bg-white/5 text-[#888888] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2b2b2b]">
        {filtered.map((plugin) => (
          <div
            key={plugin.id}
            className="p-3 hover:bg-white/5 transition-colors space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded bg-[#2b2b2b] flex items-center justify-center shrink-0 border border-white/10 text-[#007acc]">
                  {plugin.customCode ? <Code2 size={18} /> : <Settings size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-[12px]">
                      {plugin.displayName}
                    </span>
                    <span className="text-[10px] text-[#888888]">v{plugin.version}</span>
                  </div>
                  <div className="text-[11px] text-[#888888]">{plugin.publisher}</div>
                </div>
              </div>

              {/* Enable / Disable Button */}
              <button
                id={`toggle-plugin-${plugin.id}`}
                onClick={() => onTogglePlugin(plugin.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 ${
                  plugin.enabled
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-white/10 text-[#cccccc] hover:bg-[#007acc] hover:text-white'
                }`}
              >
                {plugin.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            <p className="text-[11px] text-[#aaaaaa] leading-relaxed line-clamp-2">
              {plugin.description}
            </p>

            {/* Plugin Metrics & Commands */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-[#888888]">
              <div className="flex items-center gap-3">
                {plugin.downloads && (
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {(plugin.downloads / 1000000).toFixed(1)}M
                  </span>
                )}
                {plugin.rating && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={11} fill="currentColor" /> {plugin.rating}
                  </span>
                )}
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                  {plugin.category}
                </span>
              </div>

              {/* Action buttons if custom plugin or has commands */}
              <div className="flex items-center gap-1">
                {plugin.enabled && plugin.contributes?.commands?.[0] && (
                  <button
                    onClick={() => onRunPluginCommand(plugin.contributes!.commands![0].id)}
                    title={`Run: ${plugin.contributes.commands[0].title}`}
                    className="p-1 hover:bg-white/10 rounded text-sky-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    <Play size={10} />
                    <span>Run</span>
                  </button>
                )}
                {!plugin.builtIn && (
                  <button
                    onClick={() => {
                      if (confirm(`Uninstall custom plugin "${plugin.displayName}"?`)) {
                        onDeletePlugin(plugin.id);
                      }
                    }}
                    title="Uninstall"
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
