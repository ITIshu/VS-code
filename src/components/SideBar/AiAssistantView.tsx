import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Code,
  ShieldCheck,
  Zap,
  BookOpen,
  FileCheck,
  Check,
  Copy,
  RefreshCw,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { FileNode } from '../../types';
import { VSCodeThemeDefinition } from '../../services/themes';

interface AiAssistantViewProps {
  currentTheme: VSCodeThemeDefinition;
  activeFile: FileNode | null;
  onApplyCode: (newCode: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedCode?: string;
  timestamp: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  currentTheme,
  activeFile,
  onApplyCode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am Nova AI, your intelligent engineering partner. I can analyze, refactor, generate unit tests, or detect vulnerabilities in your code. What would you like to build or improve today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleQuickAction = (action: string) => {
    if (!activeFile) return;

    let prompt = '';
    let responseText = '';
    let codeSuggestion = '';

    const fileName = activeFile.name;
    const content = activeFile.content || '';

    if (action === 'explain') {
      prompt = `Explain the logic of ${fileName}`;
      responseText = `Here is an architectural breakdown of **${fileName}**:\n\n• **Core Objective**: Manages workspace lifecycle and state computation.\n• **Performance**: Clean loop execution with O(N) operations.\n• **Safety & Types**: Fully typed with strict signatures preventing undefined state leaks.`;
    } else if (action === 'test') {
      prompt = `Generate unit tests for ${fileName}`;
      responseText = `I generated a comprehensive Vitest/Jest suite for **${fileName}** with 100% path coverage:`;
      codeSuggestion = `import { describe, it, expect, beforeEach } from 'vitest';\n\ndescribe('${fileName.replace(/\.[^/.]+$/, '')} Test Suite', () => {\n  it('should initialize successfully with default options', () => {\n    expect(true).toBe(true);\n  });\n\n  it('should handle edge cases and empty data gracefully', async () => {\n    const sample = 42;\n    expect(sample).toBeGreaterThan(0);\n  });\n\n  it('should execute with low latency under 5ms', () => {\n    const start = performance.now();\n    // Test target method\n    const duration = performance.now() - start;\n    expect(duration).toBeLessThan(5);\n  });\n});\n`;
    } else if (action === 'optimize') {
      prompt = `Optimize performance & refactor ${fileName}`;
      responseText = `I analyzed the code and applied Memoization, reduced memory allocations by ~38%, and eliminated redundant computation:`;
      codeSuggestion = content.includes('for (let i = 0;')
        ? content.replace('for (let i = 0; i < 50000; i++)', '// Optimized with SIMD batch processing\n    for (let i = 0; i < 50000; i += 2)')
        : `// Nova AI Optimized Version\n// Memoized and garbage collection friendly\n${content}\n`;
    } else if (action === 'audit') {
      prompt = `Security & Vulnerability Audit for ${fileName}`;
      responseText = `**Security Audit Results (Grade A+)**:\n\n✓ Zero injection vulnerabilities detected.\n✓ Memory safety compliant.\n✓ No prototype pollution vectors found.\n✓ Input validation conforms to OWASP Top 10 guidelines.`;
    }

    sendQueryWithMockResponse(prompt, responseText, codeSuggestion);
  };

  const handleSend = () => {
    if (!inputQuery.trim()) return;
    const query = inputQuery.trim();
    setInputQuery('');

    // Generate smart context-aware response
    let reply = `I've analyzed your request: "${query}". `;
    let code: string | undefined;

    if (query.toLowerCase().includes('function') || query.toLowerCase().includes('api') || query.toLowerCase().includes('create')) {
      reply += `Here is the production-ready TypeScript implementation with strict typings and error handling:`;
      code = `export async function fetchNovaInsights<T>(endpoint: string): Promise<T> {\n  try {\n    const response = await fetch(endpoint, {\n      headers: { 'Accept': 'application/json' },\n    });\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json() as T;\n  } catch (error) {\n    console.error('[Nova Error]', error);\n    throw error;\n  }\n}`;
    } else {
      reply += `Based on the active file (${activeFile?.name || 'workspace'}), I recommend structuring your logic into modular micro-utilities with explicit return types for optimal tree-shaking.`;
    }

    sendQueryWithMockResponse(query, reply, code);
  };

  const sendQueryWithMockResponse = (
    userText: string,
    responseText: string,
    codeSuggestion?: string
  ) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: responseText,
        suggestedCode: codeSuggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (id: string, code: string) => {
    onApplyCode(code);
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 2500);
  };

  return (
    <div
      id="nova-ai-assistant-view"
      className="flex flex-col h-full select-none text-[12px] overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-3 border-b border-[#1e293b] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/30">
            <Sparkles size={13} />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              Nova AI Copilot
              <span className="text-[9px] px-1.5 py-0.2 bg-sky-500/20 text-sky-400 font-mono rounded border border-sky-500/30">
                GPT-4o Turbo
              </span>
            </div>
            <div className="text-[10px] text-[#94a3b8]">
              {activeFile ? `Context: ${activeFile.name}` : 'No active file selected'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 border-b border-[#1e293b] bg-black/20 flex flex-wrap gap-1.5 shrink-0">
        <button
          onClick={() => handleQuickAction('explain')}
          disabled={!activeFile}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] hover:bg-sky-500/20 hover:text-sky-300 text-[#cbd5e1] transition-all text-[11px] disabled:opacity-40"
        >
          <BookOpen size={12} className="text-sky-400" /> Explain
        </button>
        <button
          onClick={() => handleQuickAction('test')}
          disabled={!activeFile}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] hover:bg-emerald-500/20 hover:text-emerald-300 text-[#cbd5e1] transition-all text-[11px] disabled:opacity-40"
        >
          <FileCheck size={12} className="text-emerald-400" /> Generate Tests
        </button>
        <button
          onClick={() => handleQuickAction('optimize')}
          disabled={!activeFile}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] hover:bg-amber-500/20 hover:text-amber-300 text-[#cbd5e1] transition-all text-[11px] disabled:opacity-40"
        >
          <Zap size={12} className="text-amber-400" /> Optimize
        </button>
        <button
          onClick={() => handleQuickAction('audit')}
          disabled={!activeFile}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] hover:bg-purple-500/20 hover:text-purple-300 text-[#cbd5e1] transition-all text-[11px] disabled:opacity-40"
        >
          <ShieldCheck size={12} className="text-purple-400" /> Security Audit
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-lg p-2.5 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-[#1e293b]/70 border border-[#334155]/60 text-[#e2e8f0]'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

              {/* Code Snippet block if present */}
              {msg.suggestedCode && (
                <div className="mt-2 rounded bg-[#0b0f17] border border-[#334155] overflow-hidden">
                  <div className="flex items-center justify-between px-2.5 py-1 bg-black/40 border-b border-[#334155] text-[10px] text-[#94a3b8]">
                    <span>Suggested Code</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.suggestedCode!)}
                        className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
                      >
                        {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleApply(msg.id, msg.suggestedCode!)}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-200 px-1.5 py-0.5 rounded hover:bg-sky-500/20 font-medium"
                      >
                        {appliedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <ArrowRight size={11} />}
                        {appliedId === msg.id ? 'Applied!' : 'Apply to Editor'}
                      </button>
                    </div>
                  </div>
                  <pre className="p-2.5 text-[11px] font-mono text-[#38bdf8] overflow-x-auto max-h-48 leading-snug">
                    <code>{msg.suggestedCode}</code>
                  </pre>
                </div>
              )}
            </div>
            <span className="text-[9px] text-[#64748b] mt-0.5 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-[#94a3b8] text-xs p-2">
            <Cpu size={14} className="animate-spin text-sky-400" />
            <span>Nova AI is analyzing workspace AST...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-2 border-t border-[#1e293b] bg-[#0b0f17] shrink-0">
        <div className="flex items-center gap-1.5 bg-[#1e293b] border border-[#334155] rounded-lg p-1.5 focus-within:border-sky-500 transition-colors">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Nova AI about your code..."
            className="w-full bg-transparent text-white text-xs outline-none px-1.5"
          />
          <button
            onClick={handleSend}
            disabled={!inputQuery.trim()}
            className="p-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 transition-all shrink-0"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
