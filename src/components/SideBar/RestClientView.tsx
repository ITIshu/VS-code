import React, { useState } from 'react';
import {
  Send,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Code,
} from 'lucide-react';
import { VSCodeThemeDefinition } from '../../services/themes';

interface RestClientViewProps {
  currentTheme: VSCodeThemeDefinition;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface MockPreset {
  name: string;
  method: HttpMethod;
  url: string;
  body?: string;
}

export const RestClientView: React.FC<RestClientViewProps> = ({ currentTheme }) => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('body');
  const [requestBody, setRequestBody] = useState('{\n  "title": "Build Next-Gen IDE",\n  "completed": true\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Response State
  const [responseStatus, setResponseStatus] = useState<number | null>(200);
  const [statusText, setStatusText] = useState('OK');
  const [responseTime, setResponseTime] = useState(24); // ms
  const [responseSize, setResponseSize] = useState('830 B');
  const [responseBody, setResponseBody] = useState<string>(
    JSON.stringify(
      {
        userId: 1,
        id: 1,
        title: "delectus aut autem",
        completed: false,
        _nova_studio_proxy: "Connected via Cloud Edge Engine",
      },
      null,
      2
    )
  );

  const presets: MockPreset[] = [
    {
      name: 'Get Todo Item',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
    },
    {
      name: 'List Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
    },
    {
      name: 'Create Post',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      body: '{\n  "title": "Prism Studio 2.0 Launch",\n  "body": "Next-gen web IDE with built-in AI Copilot",\n  "userId": 1\n}',
    },
    {
      name: 'Simulated Cloud API',
      method: 'GET',
      url: '/api/v1/workspace/status',
    },
  ];

  const handleSend = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      if (url.startsWith('https://')) {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: method !== 'GET' ? requestBody : undefined,
        });
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        setResponseStatus(res.status);
        setStatusText(res.statusText || 'OK');
        setResponseTime(duration);
        const text = JSON.stringify(data, null, 2);
        setResponseBody(text);
        setResponseSize(`${new Blob([text]).size} B`);
      } else {
        // Internal / simulated endpoint
        await new Promise((r) => setTimeout(r, 120));
        const duration = Math.round(performance.now() - start);
        setResponseStatus(200);
        setStatusText('OK (Mocked Service)');
        setResponseTime(duration);
        const mockData = {
          service: 'Nova Cloud Runtime API',
          status: 'operational',
          memory_usage_mb: 48.2,
          active_workers: 4,
          timestamp: new Date().toISOString(),
        };
        const text = JSON.stringify(mockData, null, 2);
        setResponseBody(text);
        setResponseSize(`${new Blob([text]).size} B`);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setStatusText('Network Error');
      setResponseBody(JSON.stringify({ error: err?.message || 'Failed to fetch' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="nova-rest-client-view" className="flex flex-col h-full select-none text-[12px] overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#1e293b] bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
            <Globe size={13} />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              Nova REST Client
              <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono rounded">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-[#94a3b8]">In-IDE HTTP API Tester</div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-2 border-b border-[#1e293b] bg-black/20">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
          Quick API Presets
        </div>
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setMethod(p.method);
                setUrl(p.url);
                if (p.body) setRequestBody(p.body);
              }}
              className="px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#334155] text-[10px] text-[#cbd5e1] hover:text-white transition-colors flex items-center gap-1"
            >
              <span
                className={`font-mono text-[9px] font-bold ${
                  p.method === 'GET'
                    ? 'text-emerald-400'
                    : p.method === 'POST'
                    ? 'text-sky-400'
                    : 'text-amber-400'
                }`}
              >
                {p.method}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Request Address Bar */}
      <div className="p-2 border-b border-[#1e293b] space-y-2">
        <div className="flex items-center gap-1.5">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs font-bold font-mono outline-none text-white shrink-0"
          >
            <option value="GET" className="text-emerald-400">GET</option>
            <option value="POST" className="text-sky-400">POST</option>
            <option value="PUT" className="text-amber-400">PUT</option>
            <option value="DELETE" className="text-red-400">DELETE</option>
            <option value="PATCH" className="text-purple-400">PATCH</option>
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource"
            className="flex-1 min-w-0 bg-[#0b0f17] border border-[#334155] rounded px-2 py-1 text-xs text-[#cbd5e1] font-mono outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !url.trim()}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1 transition-all shrink-0 shadow-sm"
          >
            <Send size={11} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Sending' : 'Send'}
          </button>
        </div>

        {/* Request Tabs */}
        {method !== 'GET' && (
          <div>
            <div className="text-[10px] text-[#94a3b8] mb-1 font-semibold">JSON Request Body:</div>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={3}
              className="w-full bg-[#0b0f17] border border-[#334155] rounded p-2 text-xs font-mono text-[#38bdf8] outline-none"
            />
          </div>
        )}
      </div>

      {/* Response Panel */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0b0f17]">
        {/* Response Metadata Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e293b] bg-black/40 text-[11px]">
          <div className="flex items-center gap-3">
            {responseStatus ? (
              <span
                className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] flex items-center gap-1 ${
                  responseStatus < 300
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {responseStatus < 300 ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {responseStatus} {statusText}
              </span>
            ) : (
              <span className="text-[#64748b]">Ready</span>
            )}
            <span className="text-[#64748b] flex items-center gap-1">
              <Clock size={11} /> {responseTime}ms
            </span>
            <span className="text-[#64748b]">{responseSize}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-[#94a3b8] hover:text-white px-2 py-0.5 rounded hover:bg-white/5"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Response'}
          </button>
        </div>

        {/* Response Body */}
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] text-[#e2e8f0] leading-relaxed">
          <pre className="text-emerald-300 whitespace-pre-wrap">{responseBody}</pre>
        </div>
      </div>
    </div>
  );
};
