import { FileNode } from '../types';

export const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'c':
    case 'cpp':
    case 'h':
      return 'cpp';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
    case 'svg':
      return 'xml';
    default:
      return 'plaintext';
  }
};

export const INITIAL_FILES: FileNode[] = [
  {
    id: 'folder-src',
    name: 'src',
    path: '/src',
    type: 'folder',
    language: '',
    isOpen: true,
    children: [
      {
        id: 'file-index-ts',
        name: 'index.ts',
        path: '/src/index.ts',
        type: 'file',
        language: 'typescript',
        content: `// Welcome to VS Code Web Editor!
// Features: Full Monaco engine, multi-tab workspace, rich plugin system, and dark themes.

interface ProjectStats {
  files: number;
  plugins: number;
  theme: string;
  isReady: boolean;
}

export class WorkspaceManager {
  private stats: ProjectStats;

  constructor(stats: ProjectStats) {
    this.stats = stats;
  }

  public getSummary(): string {
    return \`Workspace initialized with \${this.stats.files} files and \${this.stats.plugins} active plugins.\`;
  }

  public async runBenchmark(): Promise<number> {
    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < 50000; i++) {
      sum += Math.sqrt(i) * Math.sin(i);
    }
    const duration = performance.now() - start;
    console.log(\`[Benchmark] Processed 50k iterations in \${duration.toFixed(2)}ms (Checksum: \${sum.toFixed(2)})\`);
    return duration;
  }
}

// Quick Test Execution (Click "Run Code" in the top bar or panel!)
const manager = new WorkspaceManager({
  files: 8,
  plugins: 6,
  theme: "VS Code Dark Modern",
  isReady: true,
});

console.log(manager.getSummary());
manager.runBenchmark();
`,
      },
      {
        id: 'file-math-ts',
        name: 'math.ts',
        path: '/src/math.ts',
        type: 'file',
        language: 'typescript',
        content: `/**
 * Math Algorithms and Utilities
 * Test formatting with Prettier and linting with the ESLint Plugin!
 */

export function fibonacci(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const seq: number[] = [0, 1];
  while (seq.length < n) {
    const next = seq[seq.length - 1] + seq[seq.length - 2];
    seq.push(next);
  }
  return seq;
}

export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// Compute prime numbers up to 100
const primes = Array.from({ length: 100 }, (_, i) => i).filter(isPrime);
console.log("Found primes up to 100:", primes);
console.log("Fibonacci(10):", fibonacci(10));
`,
      },
      {
        id: 'folder-plugins',
        name: 'plugins',
        path: '/src/plugins',
        type: 'folder',
        language: '',
        isOpen: true,
        children: [
          {
            id: 'file-sample-plugin-ts',
            name: 'bannerPlugin.ts',
            path: '/src/plugins/bannerPlugin.ts',
            type: 'file',
            language: 'typescript',
            content: `// Sample Custom Plugin for the VS Code Web Editor
// You can write custom plugins directly and register them in the Extensions panel!

export function activate(context: any) {
  context.output.appendLine('Extensions', 'Custom Banner Plugin activated!');

  // Register a command that inserts an ASCII art header
  context.commands.registerCommand('insert.ascii.banner', () => {
    const banner = \`/*
 * ==========================================
 *  PROJECT: VS CODE WEB APPLICATION
 *  GENERATED: \${new Date().toISOString()}
 * ==========================================
 */\\n\`;
    context.editor.insertText(banner);
    context.notifications.show('ASCII Banner inserted into active document!', 'info');
  });

  // Create a status bar item
  const statusItem = context.statusBar.createItem('banner-status', {
    text: '$(sparkles) Banner Plugin',
    tooltip: 'Click to insert banner header',
    command: 'insert.ascii.banner',
    alignment: 'right',
  });
}
`,
          },
        ],
      },
    ],
  },
  {
    id: 'folder-scripts',
    name: 'scripts',
    path: '/scripts',
    type: 'folder',
    language: '',
    isOpen: false,
    children: [
      {
        id: 'file-analyzer-py',
        name: 'analyzer.py',
        path: '/scripts/analyzer.py',
        type: 'file',
        language: 'python',
        content: `#!/usr/bin/env python3
"""
Project Metrics Analyzer
Extracts line counts and file statistics.
"""

import sys
import os

def analyze_source_code(files_dict):
    total_lines = 0
    total_chars = 0
    
    print("=== Source Code Audit ===")
    for filename, content in files_dict.items():
        lines = content.splitlines()
        line_count = len(lines)
        char_count = len(content)
        total_lines += line_count
        total_chars += char_count
        print(f"{filename:25} : {line_count:4} lines | {char_count:6} chars")
        
    print("-" * 45)
    print(f"Total: {total_lines} lines across {len(files_dict)} files.")
    return total_lines

if __name__ == "__main__":
    sample = {
        "index.ts": "line 1\\nline 2\\nline 3",
        "math.ts": "line 1\\nline 2\\nline 3\\nline 4",
        "styles.css": "body { color: #fff; }",
    }
    analyze_source_code(sample)
`,
      },
    ],
  },
  {
    id: 'folder-styles',
    name: 'styles',
    path: '/styles',
    type: 'folder',
    language: '',
    isOpen: false,
    children: [
      {
        id: 'file-main-css',
        name: 'main.css',
        path: '/styles/main.css',
        type: 'file',
        language: 'css',
        content: `/* VS Code Editor Styling */
:root {
  --vscode-bg: #1e1e1e;
  --vscode-sidebar: #252526;
  --vscode-activitybar: #333333;
  --vscode-statusbar: #007acc;
  --vscode-accent: #007acc;
  --vscode-foreground: #cccccc;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--vscode-bg);
  color: var(--vscode-foreground);
  overflow: hidden;
}

.code-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}
`,
      },
    ],
  },
  {
    id: 'file-package-json',
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "vscode-web-workspace",
  "version": "1.0.0",
  "description": "Interactive in-browser VS Code developer environment",
  "main": "src/index.ts",
  "scripts": {
    "start": "ts-node src/index.ts",
    "test": "node scripts/analyzer.py",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "monaco-editor": "^0.56.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "prettier": "^3.2.5"
  }
}
`,
  },
  {
    id: 'file-readme-md',
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# VS Code Web Editor

A pixel-perfect VS Code experience running in your browser with full desktop functionality:

## ✨ Core Features
- 🎨 **Authentic VS Code UI & Theme**: Dark Modern, Dark+, Light Modern, Monokai, and One Dark Pro.
- 🗂️ **Multi-Tab Architecture**: Open, pin, reorder, close tabs, with dirty file tracking and split-view preview.
- 🧩 **Robust Plugin System**:
  - **Prettier**: Instant document formatting with indentation rules.
  - **ESLint / Linter**: Live syntax, variable, and pattern diagnostics shown in the Problems panel.
  - **Code Runner**: Run TypeScript and JavaScript directly in the browser with real console logs.
  - **Markdown Preview**: Side-by-side interactive markdown rendering.
  - **Todo / Fixme Scanner**: Highlights and indexes action items across your workspace.
  - **Custom Extension Studio**: Build and install your own plugins live with JavaScript/TypeScript!
- ⚡ **Full Monaco Engine**: IntelliSense, syntax tokenization, bracket matching, minimap, find & replace.
- ⌨️ **Command Palette (\`Ctrl+Shift+P\` / \`F1\`)** and Quick File Open (\`Ctrl+P\`).
- 🖥️ **Integrated Terminal & Output**: Interactive shell simulator with real commands (\`ls\`, \`cat\`, \`run\`, \`node\`, \`clear\`).

## 🚀 Getting Started
1. Click any file in the Explorer on the left to open it.
2. Edit code and observe line numbers and syntax coloring.
3. Click the **Run** ▶️ button in the top bar to evaluate code in the Output panel.
4. Try the **Markdown Preview** button when viewing this README!
`,
  },
];

const STORAGE_KEY = 'vscode_web_files_v1';

export function loadFileSystem(): FileNode[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load files from storage:', e);
  }
  return INITIAL_FILES;
}

export function saveFileSystem(files: FileNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save files to storage:', e);
  }
}

export function resetFileSystem(): FileNode[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_FILES;
}

export function findFileById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findFileByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function getAllFiles(nodes: FileNode[]): FileNode[] {
  let list: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      list.push(node);
    }
    if (node.children) {
      list = list.concat(getAllFiles(node.children));
    }
  }
  return list;
}

export function updateFileContent(
  nodes: FileNode[],
  fileId: string,
  newContent: string
): { updatedNodes: FileNode[]; isDirty: boolean } {
  let changed = false;

  const traverse = (list: FileNode[]): FileNode[] => {
    return list.map((node) => {
      if (node.id === fileId && node.type === 'file') {
        changed = true;
        return {
          ...node,
          content: newContent,
          isDirty: true,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: traverse(node.children),
        };
      }
      return node;
    });
  };

  const updatedNodes = traverse(nodes);
  return { updatedNodes, isDirty: changed };
}

export function markFileSaved(nodes: FileNode[], fileId: string): FileNode[] {
  const traverse = (list: FileNode[]): FileNode[] => {
    return list.map((node) => {
      if (node.id === fileId) {
        return { ...node, isDirty: false };
      }
      if (node.children) {
        return { ...node, children: traverse(node.children) };
      }
      return node;
    });
  };
  return traverse(nodes);
}

export function addNodeToTree(
  nodes: FileNode[],
  targetFolderId: string | null,
  newNode: FileNode
): FileNode[] {
  if (!targetFolderId) {
    return [...nodes, newNode];
  }

  const traverse = (list: FileNode[]): FileNode[] => {
    return list.map((node) => {
      if (node.id === targetFolderId && node.type === 'folder') {
        return {
          ...node,
          isOpen: true,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: traverse(node.children),
        };
      }
      return node;
    });
  };

  return traverse(nodes);
}

export function deleteNodeFromTree(nodes: FileNode[], idToDelete: string): FileNode[] {
  const traverse = (list: FileNode[]): FileNode[] => {
    return list
      .filter((node) => node.id !== idToDelete)
      .map((node) => {
        if (node.children) {
          return {
            ...node,
            children: traverse(node.children),
          };
        }
        return node;
      });
  };
  return traverse(nodes);
}

export function renameNodeInTree(nodes: FileNode[], id: string, newName: string): FileNode[] {
  const traverse = (list: FileNode[]): FileNode[] => {
    return list.map((node) => {
      if (node.id === id) {
        const lastSlash = node.path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? node.path.substring(0, lastSlash) : '';
        const newPath = `${parentPath}/${newName}`;
        const language = node.type === 'file' ? detectLanguage(newName) : '';
        return {
          ...node,
          name: newName,
          path: newPath,
          language,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: traverse(node.children),
        };
      }
      return node;
    });
  };
  return traverse(nodes);
}
