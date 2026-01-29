import { create } from "zustand";
import type { FileNode } from "@/types";

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty?: boolean;
}

interface EditorState {
  openTabs: EditorTab[];
  activeTabId: string | null;
  cursorPosition: { line: number; column: number };
  diffViewer: { isOpen: boolean; filePath: string | null; diff: string | null };
  openFile: (file: FileNode) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveFile: (tabId: string) => Promise<void>;
  setCursorPosition: (position: { line: number; column: number }) => void;
  switchToNextTab: () => void;
  switchToPreviousTab: () => void;
  applyDiff: () => void;
  rejectDiff: () => void;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    css: "css",
    scss: "scss",
    html: "html",
    md: "markdown",
    py: "python",
    prisma: "prisma",
    sql: "sql",
  };
  return langMap[ext] ?? "plaintext";
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openTabs: [],
  activeTabId: null,
  cursorPosition: { line: 1, column: 1 },
  diffViewer: { isOpen: false, filePath: null, diff: null },

  openFile: async (file: FileNode) => {
    if (file.type !== "file") return;

    const existingTab = get().openTabs.find((tab) => tab.path === file.path);
    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    let content = file.content ?? "";
    
    // If content is not provided, try to read from WebContainer
    if (!content) {
      try {
        const { webContainerManager } = await import("@/lib/webcontainer");
        const normalizedPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
        content = await webContainerManager.readFile(normalizedPath);
      } catch (err) {
        console.warn(`Failed to read file ${file.path}:`, err);
        content = "";
      }
    }

    const newTab: EditorTab = {
      id: `tab-${Date.now()}-${Math.random()}`,
      path: file.path,
      name: file.name,
      language: file.language ?? getLanguageFromPath(file.path),
      content,
      isDirty: false,
    };

    set((state) => ({
      openTabs: [...state.openTabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (tabId) => {
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.id !== tabId);
      const wasActive = state.activeTabId === tabId;
      const newActiveTabId = wasActive
        ? newTabs.length > 0
          ? newTabs[newTabs.length - 1].id
          : null
        : state.activeTabId;
      return {
        openTabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  updateTabContent: (tabId, content) => {
    set((state) => ({
      openTabs: state.openTabs.map((tab) =>
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      ),
    }));
  },

  saveFile: async (tabId) => {
    const tab = get().openTabs.find((t) => t.id === tabId);
    if (!tab) return;

    try {
      const { webContainerManager } = await import("@/lib/webcontainer");
      const normalizedPath = tab.path.startsWith("/") ? tab.path.slice(1) : tab.path;
      await webContainerManager.writeFile(normalizedPath, tab.content);
      
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.id === tabId ? { ...t, isDirty: false } : t
        ),
      }));
    } catch (err) {
      console.error(`Failed to save file ${tab.path}:`, err);
      throw err;
    }
  },

  setCursorPosition: (position) => {
    set({ cursorPosition: position });
  },

  switchToNextTab: () => {
    set((state) => {
      if (state.openTabs.length === 0) return state;
      const currentIndex = state.openTabs.findIndex((tab) => tab.id === state.activeTabId);
      const nextIndex = currentIndex < state.openTabs.length - 1 ? currentIndex + 1 : 0;
      return { activeTabId: state.openTabs[nextIndex].id };
    });
  },

  switchToPreviousTab: () => {
    set((state) => {
      if (state.openTabs.length === 0) return state;
      const currentIndex = state.openTabs.findIndex((tab) => tab.id === state.activeTabId);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : state.openTabs.length - 1;
      return { activeTabId: state.openTabs[prevIndex].id };
    });
  },

  applyDiff: () => {
    set((state) => ({
      diffViewer: { isOpen: false, filePath: null, diff: null },
    }));
  },

  rejectDiff: () => {
    set((state) => ({
      diffViewer: { isOpen: false, filePath: null, diff: null },
    }));
  },
}));
