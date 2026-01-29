"use client";

import { useRef, useEffect, useCallback } from "react";
import { X, FileCode, FileJson, FileText, FileType, Settings, Package, Lock } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { disposeModelForPath } from "./monaco-editor";

const FILE_ICONS: Record<string, { icon: typeof FileCode; color: string }> = {
  typescript: { icon: FileCode, color: "text-blue-400" },
  javascript: { icon: FileCode, color: "text-yellow-400" },
  json: { icon: FileJson, color: "text-amber-400" },
  css: { icon: FileCode, color: "text-pink-400" },
  html: { icon: FileCode, color: "text-orange-400" },
  markdown: { icon: FileText, color: "text-zinc-400" },
  python: { icon: FileCode, color: "text-green-400" },
  plaintext: { icon: FileType, color: "text-zinc-500" },
};

function getFileIcon(language: string, fileName: string) {
  if (fileName === "package.json" || fileName === "package-lock.json") {
    return { icon: Package, color: "text-red-400" };
  }
  if (fileName.startsWith(".env")) {
    return { icon: Lock, color: "text-yellow-400" };
  }
  if (fileName.includes("config")) {
    return { icon: Settings, color: "text-zinc-400" };
  }
  return FILE_ICONS[language] ?? FILE_ICONS.plaintext;
}

export function EditorTabs() {
  const tabsRef = useRef<HTMLDivElement>(null);
  const { openTabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  useEffect(() => {
    if (tabsRef.current && activeTabId) {
      const activeElement = tabsRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTabId]);

  const handleCloseTab = useCallback(
    (tabId: string, filePath: string) => {
      disposeModelForPath(filePath);
      closeTab(tabId);
    },
    [closeTab]
  );

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent, tabId: string, filePath: string) => {
      if (e.button === 1) {
        e.preventDefault();
        handleCloseTab(tabId, filePath);
      }
    },
    [handleCloseTab]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, _tabId: string) => {
      e.preventDefault();
    },
    []
  );

  if (openTabs.length === 0) {
    return null;
  }

    return (
      <div 
        ref={tabsRef}
        className="flex h-10 shrink-0 items-center overflow-x-auto border-b border-white/[0.08] bg-[#0a0a0a]"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
      >
          {openTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const { icon: Icon, color } = getFileIcon(tab.language, tab.name);

            return (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseDown={(e) => handleMiddleClick(e, tab.id, tab.path)}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                className={`group relative flex h-full shrink-0 cursor-pointer items-center gap-2 border-r border-white/[0.08] px-3 text-sm transition-colors select-none ${
                  isActive
                    ? "bg-[#080808] text-zinc-200"
                    : "bg-[#0a0a0a] text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
              
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              <span className="max-w-[120px] truncate">{tab.name}</span>
              
              {tab.isDirty && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" />
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id, tab.path);
                }}
                className="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-all hover:bg-[#1a1a24] group-hover:opacity-100"
                title="Close (Cmd+W)"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
    </div>
  );
}

