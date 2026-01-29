export type AgentState = 
  | "IDLE" 
  | "ANALYZING" 
  | "PLANNING" 
  | "EXECUTING" 
  | "TESTING" 
  | "COMPLETED" 
  | "FAILED";

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  logs?: string[];
}

export type NextJsSpecialFile = 
  | "page" 
  | "layout" 
  | "loading" 
  | "error" 
  | "not-found" 
  | "route" 
  | "template" 
  | "default" 
  | "middleware";

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  language?: string;
  content?: string;
  children?: FileNode[];
}
