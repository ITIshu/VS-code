export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language: string;
  children?: FileNode[];
  isOpen?: boolean;
  isDirty?: boolean;
}

export interface TabItem {
  fileId: string;
  path: string;
  title: string;
  language: string;
  isDirty: boolean;
}

export interface EditorSettings {
  theme: string;
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
  autoSave: boolean;
  formatOnSave: boolean;
  bracketPairColorization: boolean;
}

export interface DiagnosticItem {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: string;
}

export interface OutputMessage {
  id: string;
  timestamp: string;
  channel: string;
  text: string;
  type?: 'log' | 'info' | 'error' | 'success';
}

export type ActiveSideBarView =
  | 'explorer'
  | 'search'
  | 'git'
  | 'extensions'
  | 'ai-assistant'
  | 'rest-client'
  | 'code-radar'
  | 'settings';
export type ActivePanelView = 'problems' | 'output' | 'terminal' | 'debug';
