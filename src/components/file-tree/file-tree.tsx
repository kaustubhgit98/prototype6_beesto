"use client";

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Search,
  RefreshCw,
  FilePlus,
  FolderPlus,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Settings,
  Package,
  Image,
  FileCode2,
  Database,
  Route,
  Layout,
  AlertCircle,
  Loader as LoaderIcon,
  Lock,
  Copy,
  Trash2,
  Pencil,
  Terminal,
  X,
  Check,
} from "lucide-react";
import type { FileNode, NextJsSpecialFile } from "@/types";
import { useFileTreeStore } from "@/lib/stores/file-tree-store";
import { useEditorStore } from "@/lib/stores/editor-store";

const NEXTJS_SPECIAL_FILES: Record<NextJsSpecialFile, { icon: typeof FileCode; color: string }> = {
  page: { icon: FileCode2, color: "text-emerald-400" },
  layout: { icon: Layout, color: "text-zinc-400" },
  loading: { icon: LoaderIcon, color: "text-amber-400" },
  error: { icon: AlertCircle, color: "text-red-400" },
  "not-found": { icon: AlertCircle, color: "text-orange-400" },
  route: { icon: Route, color: "text-cyan-400" },
  template: { icon: Layout, color: "text-zinc-400" },
  default: { icon: FileCode2, color: "text-zinc-400" },
  middleware: { icon: Lock, color: "text-yellow-400" },
};

const FILE_ICONS: Record<string, { icon: typeof FileCode; color: string }> = {
  typescript: { icon: FileCode, color: "text-blue-400" },
  javascript: { icon: FileCode, color: "text-yellow-400" },
  json: { icon: FileJson, color: "text-amber-400" },
  css: { icon: FileCode, color: "text-cyan-400" },
  scss: { icon: FileCode, color: "text-cyan-400" },
  html: { icon: FileCode, color: "text-orange-400" },
  markdown: { icon: FileText, color: "text-zinc-400" },
  python: { icon: FileCode, color: "text-green-400" },
  prisma: { icon: Database, color: "text-teal-400" },
  sql: { icon: Database, color: "text-blue-400" },
  image: { icon: Image, color: "text-zinc-400" },
  config: { icon: Settings, color: "text-zinc-400" },
  package: { icon: Package, color: "text-red-400" },
  env: { icon: Lock, color: "text-yellow-400" },
  plaintext: { icon: FileType, color: "text-zinc-500" },
};

const CONFIG_FILES = [
  "next.config",
  "tailwind.config",
  "postcss.config",
  "tsconfig",
  "jsconfig",
  "eslint.config",
  ".eslintrc",
  "prettier.config",
  ".prettierrc",
  "vite.config",
  "webpack.config",
];

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"];

function getNextJsSpecialFile(name: string): NextJsSpecialFile | null {
  const baseName = name.replace(/\.(tsx?|jsx?)$/, "");
  if (baseName in NEXTJS_SPECIAL_FILES) {
    return baseName as NextJsSpecialFile;
  }
  return null;
}

function getFileIconAndColor(node: FileNode): { icon: typeof FileCode; color: string } {
  const name = node.name.toLowerCase();
  const ext = name.split(".").pop() ?? "";

  if (name === "package.json" || name === "package-lock.json") {
    return FILE_ICONS.package;
  }

  if (name.startsWith(".env")) {
    return FILE_ICONS.env;
  }

  if (CONFIG_FILES.some((c) => name.startsWith(c))) {
    return FILE_ICONS.config;
  }

  if (IMAGE_EXTENSIONS.includes(ext)) {
    return FILE_ICONS.image;
  }

  const specialFile = getNextJsSpecialFile(node.name);
  if (specialFile) {
    return NEXTJS_SPECIAL_FILES[specialFile];
  }

  const language = node.language ?? "plaintext";
  return FILE_ICONS[language] ?? FILE_ICONS.plaintext;
}

function getRouteFromPath(path: string): string | null {
  const appMatch = path.match(/\/app(.*)\/page\.(tsx?|jsx?)$/);
  if (appMatch) {
    const route = appMatch[1] || "/";
    return route.replace(/\/\([^)]+\)/g, "");
  }
  
  const apiMatch = path.match(/\/app\/api(.*)\/route\.(tsx?|jsx?)$/);
  if (apiMatch) {
    return `/api${apiMatch[1] || ""}`;
  }
  
  return null;
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === "directory" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });
}

function filterNodes(nodes: FileNode[], searchTerm: string): FileNode[] {
  if (!searchTerm) return nodes;
  
  const term = searchTerm.toLowerCase();

  function filterTree(node: FileNode): FileNode | null {
    if (node.type === "file") {
      return node.name.toLowerCase().includes(term) ? node : null;
    }

    if (node.children) {
      const filteredChildren = node.children
        .map(filterTree)
        .filter((n): n is FileNode => n !== null);

      if (filteredChildren.length > 0 || node.name.toLowerCase().includes(term)) {
        return { ...node, children: filteredChildren, isOpen: true };
      }
    }

    return null;
  }

  return nodes.map(filterTree).filter((n): n is FileNode => n !== null);
}

interface FileTreeItemProps {
  node: FileNode;
  depth?: number;
}

function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
  const {
    selectedPath,
    expandedPaths,
    searchTerm,
    renamingPath,
    setSelectedPath,
    toggleExpanded,
    openContextMenu,
    renameNode,
    cancelRename,
  } = useFileTreeStore();
  const { openFile } = useEditorStore();
  const [renameValue, setRenameValue] = useState(node.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isDirectory = node.type === "directory";
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isRenaming = renamingPath === node.path;

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setRenameValue(node.name);
  }, [node.name]);

  const handleClick = useCallback(() => {
    if (isRenaming) return;
    setSelectedPath(node.path);
    if (isDirectory) {
      toggleExpanded(node.path);
    } else {
      openFile(node);
    }
  }, [node, isDirectory, isRenaming, setSelectedPath, toggleExpanded, openFile]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setSelectedPath(node.path);
      openContextMenu(node.path, { x: e.clientX, y: e.clientY });
    },
    [node.path, setSelectedPath, openContextMenu]
  );

  const handleRenameSubmit = useCallback(() => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameNode(node.path, renameValue.trim());
    } else {
      cancelRename();
    }
  }, [renameValue, node.name, node.path, renameNode, cancelRename]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setRenameValue(node.name);
        cancelRename();
      }
    },
    [handleRenameSubmit, node.name, cancelRename]
  );

  const { icon: FileIcon, color } = getFileIconAndColor(node);
  const route = getRouteFromPath(node.path);

  const highlightedName = useMemo(() => {
    if (!searchTerm) return node.name;
    const idx = node.name.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return node.name;
    return (
      <>
        {node.name.slice(0, idx)}
        <span className="bg-amber-500/30 text-amber-200">
          {node.name.slice(idx, idx + searchTerm.length)}
        </span>
        {node.name.slice(idx + searchTerm.length)}
      </>
    );
  }, [node.name, searchTerm]);

  const sortedChildren = useMemo(() => {
    if (!node.children) return [];
    return sortNodes(node.children);
  }, [node.children]);

  return (
    <div>
        <button
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className={`group flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors ${
            isSelected
              ? "bg-white/10 text-zinc-100"
              : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
          }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        title={route ? `Route: ${route}` : node.path}
      >
        {isDirectory ? (
          <>
            <span className="shrink-0 transition-transform duration-150">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              )}
            </span>
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-zinc-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <FileIcon className={`h-4 w-4 shrink-0 ${color}`} />
          </>
        )}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#1a1a24] px-1 py-0.5 text-sm text-zinc-200 outline-none ring-1 ring-white/30 rounded"
          />
        ) : (
          <span className="truncate">{highlightedName}</span>
        )}
        {route && !isRenaming && (
          <span className="ml-auto text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {route}
          </span>
        )}
      </button>
      {isDirectory && isExpanded && sortedChildren.length > 0 && (
        <div>
          {sortedChildren.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewItemInput({ parentPath, type }: { parentPath: string; type: "file" | "folder" }) {
  const { addNode, cancelNewItem } = useFileTreeStore();
  const { openFile } = useEditorStore();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) {
      cancelNewItem();
      return;
    }

    const newPath = parentPath === "/" ? `/${value.trim()}` : `${parentPath}/${value.trim()}`;
    const newNode: FileNode = {
      id: `new-${Date.now()}`,
      name: value.trim(),
      path: newPath,
      type: type === "folder" ? "directory" : "file",
      ...(type === "file" && {
        language: getLanguageFromName(value.trim()),
        content: "",
      }),
      ...(type === "folder" && { children: [] }),
    };

    addNode(parentPath, newNode);
    
    if (type === "file") {
      openFile(newNode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelNewItem();
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      <span className="w-3.5 shrink-0" />
      {type === "folder" ? (
        <Folder className="h-4 w-4 shrink-0 text-zinc-400" />
      ) : (
        <FileCode className="h-4 w-4 shrink-0 text-blue-400" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder={type === "folder" ? "folder name" : "file name"}
        className="flex-1 bg-[#1a1a24] px-1 py-0.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none ring-1 ring-white/30 rounded"
      />
    </div>
  );
}

function getLanguageFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    json: "json", css: "css", scss: "scss", html: "html", md: "markdown",
    py: "python", prisma: "prisma", sql: "sql",
  };
  return langMap[ext] ?? "plaintext";
}

function ContextMenu() {
  const { 
    contextMenuPath, 
    contextMenuPosition, 
    closeContextMenu,
    startRename,
    deleteNode,
    startNewItem,
    rootNodes,
  } = useFileTreeStore();
  const { closeFile } = useEditorStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    
    if (contextMenuPosition) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenuPosition, closeContextMenu]);

  if (!contextMenuPosition || !contextMenuPath) return null;

  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const currentNode = findNode(rootNodes, contextMenuPath);
  const isDirectory = currentNode?.type === "directory";
  const parentPath = contextMenuPath.split("/").slice(0, -1).join("/") || "/";

  const handleNewFile = () => {
    const targetPath = isDirectory ? contextMenuPath : parentPath;
    startNewItem(targetPath, "file");
  };

  const handleNewFolder = () => {
    const targetPath = isDirectory ? contextMenuPath : parentPath;
    startNewItem(targetPath, "folder");
  };

  const handleRename = () => {
    startRename(contextMenuPath);
  };

  const handleDelete = () => {
    closeFile(contextMenuPath);
    deleteNode(contextMenuPath);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(contextMenuPath);
  };

  const menuItems = [
    { icon: FilePlus, label: "New File", action: handleNewFile },
    { icon: FolderPlus, label: "New Folder", action: handleNewFolder },
    { type: "divider" as const },
    { icon: Pencil, label: "Rename", action: handleRename },
    { icon: Copy, label: "Copy Path", action: handleCopyPath },
    { type: "divider" as const },
    { icon: Trash2, label: "Delete", action: handleDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg border border-[#1a1a24] bg-[#0c0c10] p-1 shadow-xl"
      style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
    >
      {menuItems.map((item, idx) =>
        item.type === "divider" ? (
          <div key={idx} className="my-1 h-px bg-[#1a1a24]" />
        ) : (
          <button
            key={idx}
            onClick={() => {
              item.action?.();
              closeContextMenu();
            }}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
              item.danger
                ? "text-red-400 hover:bg-red-500/10"
                : "text-zinc-300 hover:bg-[#1a1a24]"
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

const MOCK_FILES: FileNode[] = [
  {
    id: "1",
    name: "src",
    type: "directory",
    path: "/src",
    children: [
      {
        id: "2",
        name: "app",
        type: "directory",
        path: "/src/app",
        children: [
          {
            id: "3",
            name: "page.tsx",
            type: "file",
            path: "/src/app/page.tsx",
            language: "typescript",
            content: `export default function Home() {\n  return (\n    <main>\n      <h1>Welcome to Next.js</h1>\n    </main>\n  );\n}`,
          },
          {
            id: "4",
            name: "layout.tsx",
            type: "file",
            path: "/src/app/layout.tsx",
            language: "typescript",
            content: `export default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}`,
          },
          {
            id: "5",
            name: "globals.css",
            type: "file",
            path: "/src/app/globals.css",
            language: "css",
            content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
          },
          {
            id: "6",
            name: "api",
            type: "directory",
            path: "/src/app/api",
            children: [
              {
                id: "7",
                name: "hello",
                type: "directory",
                path: "/src/app/api/hello",
                children: [
                  {
                    id: "8",
                    name: "route.ts",
                    type: "file",
                    path: "/src/app/api/hello/route.ts",
                    language: "typescript",
                    content: `export async function GET() {\n  return Response.json({ message: "Hello" });\n}`,
                  },
                ],
              },
            ],
          },
          {
            id: "20",
            name: "editor",
            type: "directory",
            path: "/src/app/editor",
            children: [
              {
                id: "21",
                name: "page.tsx",
                type: "file",
                path: "/src/app/editor/page.tsx",
                language: "typescript",
                content: `"use client";\n\nexport default function EditorPage() {\n  return <div>Editor</div>;\n}`,
              },
            ],
          },
        ],
      },
      {
        id: "9",
        name: "components",
        type: "directory",
        path: "/src/components",
        children: [
          {
            id: "10",
            name: "ui",
            type: "directory",
            path: "/src/components/ui",
            children: [
              {
                id: "11",
                name: "button.tsx",
                type: "file",
                path: "/src/components/ui/button.tsx",
                language: "typescript",
                content: `export function Button({ children }) {\n  return <button className="btn">{children}</button>;\n}`,
              },
            ],
          },
        ],
      },
      {
        id: "12",
        name: "lib",
        type: "directory",
        path: "/src/lib",
        children: [
          {
            id: "13",
            name: "utils.ts",
            type: "file",
            path: "/src/lib/utils.ts",
            language: "typescript",
            content: `export function cn(...classes: string[]) {\n  return classes.filter(Boolean).join(" ");\n}`,
          },
        ],
      },
    ],
  },
  {
    id: "14",
    name: "public",
    type: "directory",
    path: "/public",
    children: [
      {
        id: "15",
        name: "favicon.ico",
        type: "file",
        path: "/public/favicon.ico",
        language: "plaintext",
      },
    ],
  },
  {
    id: "16",
    name: "package.json",
    type: "file",
    path: "/package.json",
    language: "json",
    content: `{\n  "name": "my-app",\n  "version": "0.1.0",\n  "scripts": {\n    "dev": "next dev"\n  }\n}`,
  },
  {
    id: "17",
    name: "tsconfig.json",
    type: "file",
    path: "/tsconfig.json",
    language: "json",
    content: `{\n  "compilerOptions": {\n    "strict": true\n  }\n}`,
  },
  {
    id: "18",
    name: "next.config.ts",
    type: "file",
    path: "/next.config.ts",
    language: "typescript",
    content: `const config = {};\nexport default config;`,
  },
  {
    id: "19",
    name: ".env.local",
    type: "file",
    path: "/.env.local",
    language: "plaintext",
    content: `DATABASE_URL=postgresql://localhost:5432/db`,
  },
];

export function FileTree() {
  const {
    rootNodes,
    searchTerm,
    isLoading,
    newItemParent,
    newItemType,
    setRootNodes,
    setSearchTerm,
    refreshTree,
    startNewItem,
  } = useFileTreeStore();

  useEffect(() => {
    // Load files from WebContainer when component mounts
    // The WebContainer manager will handle booting if needed
    const loadFiles = async () => {
      if (rootNodes.length === 0) {
        try {
          await refreshTree();
        } catch (err) {
          console.error("Failed to load files:", err);
          // Fallback to mock data if WebContainer fails or is not available
          setRootNodes(MOCK_FILES);
        }
      }
    };
    loadFiles();
  }, [rootNodes.length, setRootNodes, refreshTree]);

  const filteredNodes = useMemo(() => {
    return filterNodes(rootNodes, searchTerm);
  }, [rootNodes, searchTerm]);

  const handleRefresh = useCallback(async () => {
    await refreshTree();
  }, [refreshTree]);

  const handleNewFile = useCallback(() => {
    startNewItem("/", "file");
  }, [startNewItem]);

  const handleNewFolder = useCallback(() => {
    startNewItem("/", "folder");
  }, [startNewItem]);

  return (
    <div className="flex h-full flex-col bg-[#0c0c10]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#1a1a24] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleNewFile}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a24] rounded transition-colors"
            title="New file"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a24] rounded transition-colors"
            title="New folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a24] rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-2 py-2 border-b border-[#1a1a24]">
        <div className="flex items-center gap-2 rounded-md bg-[#12121a] px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {newItemParent === "/" && newItemType && (
          <NewItemInput parentPath="/" type={newItemType} />
        )}
        {filteredNodes.length === 0 && !newItemParent ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        ) : (
          sortNodes(filteredNodes).map((node) => (
            <FileTreeItemWithNewInput key={node.id} node={node} />
          ))
        )}
      </div>

      <ContextMenu />
    </div>
  );
}

function FileTreeItemWithNewInput({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const { newItemParent, newItemType, expandedPaths } = useFileTreeStore();
  const isDirectory = node.type === "directory";
  const isExpanded = expandedPaths.has(node.path);
  const showNewInput = newItemParent === node.path && newItemType;

  const sortedChildren = useMemo(() => {
    if (!node.children) return [];
    return sortNodes(node.children);
  }, [node.children]);

  return (
    <>
      <FileTreeItem node={node} depth={depth} />
      {isDirectory && isExpanded && (
        <>
          {showNewInput && (
            <div style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
              <NewItemInput parentPath={node.path} type={newItemType} />
            </div>
          )}
          {sortedChildren.map((child) => (
            <FileTreeItemWithNewInput key={child.id} node={child} depth={depth + 1} />
          ))}
        </>
      )}
    </>
  );
}

