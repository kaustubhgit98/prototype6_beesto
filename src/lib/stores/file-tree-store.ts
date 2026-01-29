import { create } from "zustand";
import type { FileNode } from "@/types";
import { webContainerManager } from "@/lib/webcontainer";

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

async function buildFileTree(path: string = "/", parentId: string = "root"): Promise<FileNode[]> {
  try {
    const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path.slice(1) : path;
    const entries = await webContainerManager.readDirectory(normalizedPath || "/");
    
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Skip node_modules and .next directories
      if (entry === "node_modules" || entry === ".next") continue;

      const fullPath = normalizedPath ? `/${normalizedPath}/${entry}` : `/${entry}`;
      const entryPath = normalizedPath ? `${normalizedPath}/${entry}` : entry;

      // Check if it's a directory
      const isDirectory = await webContainerManager.isDirectory(entryPath);

      if (isDirectory) {
        const children = await buildFileTree(fullPath, `${parentId}-${entry}`);
        nodes.push({
          id: `${parentId}-${entry}`,
          name: entry,
          path: fullPath,
          type: "directory",
          children,
        });
      } else {
        // It's a file
        try {
          const content = await webContainerManager.readFile(entryPath);
          nodes.push({
            id: `${parentId}-${entry}`,
            name: entry,
            path: fullPath,
            type: "file",
            language: getLanguageFromPath(entry),
            content,
          });
        } catch (err) {
          // If readFile fails, create node without content
          nodes.push({
            id: `${parentId}-${entry}`,
            name: entry,
            path: fullPath,
            type: "file",
            language: getLanguageFromPath(entry),
            content: "",
          });
        }
      }
    }

    return nodes;
  } catch (err) {
    console.warn(`Failed to read directory ${path}:`, err);
    return [];
  }
}

interface FileTreeState {
  rootNodes: FileNode[];
  selectedPath: string | null;
  expandedPaths: Set<string>;
  searchTerm: string;
  isLoading: boolean;
  renamingPath: string | null;
  contextMenuPath: string | null;
  contextMenuPosition: { x: number; y: number } | null;
  newItemParent: string | null;
  newItemType: "file" | "folder" | null;
  setRootNodes: (nodes: FileNode[]) => void;
  setSelectedPath: (path: string | null) => void;
  toggleExpanded: (path: string) => void;
  setSearchTerm: (term: string) => void;
  refreshTree: () => Promise<void>;
  renameNode: (oldPath: string, newName: string) => Promise<void>;
  startRename: (path: string) => void;
  cancelRename: () => void;
  deleteNode: (path: string) => Promise<void>;
  addNode: (parentPath: string, node: FileNode) => Promise<void>;
  openContextMenu: (path: string, position: { x: number; y: number }) => void;
  closeContextMenu: () => void;
  startNewItem: (parentPath: string, type: "file" | "folder") => void;
  cancelNewItem: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  rootNodes: [],
  selectedPath: null,
  expandedPaths: new Set<string>(),
  searchTerm: "",
  isLoading: false,
  renamingPath: null,
  contextMenuPath: null,
  contextMenuPosition: null,
  newItemParent: null,
  newItemType: null,

  setRootNodes: (nodes) => set({ rootNodes: nodes }),

  setSelectedPath: (path) => set({ selectedPath: path }),

  toggleExpanded: (path) => {
    set((state) => {
      const newExpanded = new Set(state.expandedPaths);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return { expandedPaths: newExpanded };
    });
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  refreshTree: async () => {
    set({ isLoading: true });
    try {
      const nodes = await buildFileTree();
      set({ rootNodes: nodes });
    } catch (err) {
      console.error("Failed to refresh file tree:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  renameNode: async (oldPath, newName) => {
    try {
      const normalizedOldPath = oldPath.startsWith("/") ? oldPath.slice(1) : oldPath;
      const pathParts = normalizedOldPath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = "/" + pathParts.join("/");
      const normalizedNewPath = newPath.slice(1);

      await webContainerManager.renameFile(normalizedOldPath, normalizedNewPath);
      
      // Update the tree
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.path === oldPath) {
            return {
              ...node,
              name: newName,
              path: newPath,
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateNode(node.children),
            };
          }
          return node;
        });
      };

      set((state) => ({
        rootNodes: updateNode(state.rootNodes),
        renamingPath: null,
      }));
    } catch (err) {
      console.error(`Failed to rename ${oldPath}:`, err);
      throw err;
    }
  },

  startRename: (path) => set({ renamingPath: path }),

  cancelRename: () => set({ renamingPath: null }),

  deleteNode: async (path) => {
    try {
      const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
      await webContainerManager.deleteFile(normalizedPath);

      const removeNode = (nodes: FileNode[]): FileNode[] => {
        return nodes
          .filter((node) => node.path !== path)
          .map((node) => {
            if (node.children) {
              return {
                ...node,
                children: removeNode(node.children),
              };
            }
            return node;
          });
      };

      set((state) => ({
        rootNodes: removeNode(state.rootNodes),
      }));
    } catch (err) {
      console.error(`Failed to delete ${path}:`, err);
      throw err;
    }
  },

  addNode: async (parentPath, node) => {
    try {
      const normalizedPath = node.path.startsWith("/") ? node.path.slice(1) : node.path;

      if (node.type === "directory") {
        await webContainerManager.mkdir(normalizedPath);
      } else {
        await webContainerManager.writeFile(normalizedPath, node.content || "");
      }

      const insertNode = (nodes: FileNode[], targetPath: string): FileNode[] => {
        return nodes.map((n) => {
          if (n.path === targetPath) {
            return {
              ...n,
              children: [...(n.children || []), node],
            };
          }
          if (n.children) {
            return {
              ...n,
              children: insertNode(n.children, targetPath),
            };
          }
          return n;
        });
      };

      set((state) => ({
        rootNodes: parentPath === "/" ? [...state.rootNodes, node] : insertNode(state.rootNodes, parentPath),
        newItemParent: null,
        newItemType: null,
      }));
    } catch (err) {
      console.error(`Failed to add node ${node.path}:`, err);
      throw err;
    }
  },

  openContextMenu: (path, position) =>
    set({ contextMenuPath: path, contextMenuPosition: position }),

  closeContextMenu: () =>
    set({ contextMenuPath: null, contextMenuPosition: null }),

  startNewItem: (parentPath, type) =>
    set({ newItemParent: parentPath, newItemType: type }),

  cancelNewItem: () =>
    set({ newItemParent: null, newItemType: null }),
}));
