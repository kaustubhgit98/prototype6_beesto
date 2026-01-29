"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { EditorTabs } from "./editor-tabs";
import { MonacoEditor } from "./monaco-editor";
import { StatusBar } from "./status-bar";
import { DiffViewer } from "./diff-viewer";
import { FileTree } from "@/components/file-tree/file-tree";
import { useEditorStore } from "@/lib/stores/editor-store";

export function EditorPanel() {
  const { openTabs, activeTabId, updateTabContent, saveFile } = useEditorStore();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const autoSaveDelay = 1000; // 1 second delay
  const autoSaveEnabled = true;

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);

  const handleAutoSave = useCallback(
    async (content: string) => {
      if (!activeTab || !autoSaveEnabled) return;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(async () => {
        try {
          if (activeTabId) {
            await saveFile(activeTabId);
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, autoSaveDelay);

      setDebounceTimer(timer);
    },
    [activeTab, activeTabId, autoSaveEnabled, debounceTimer, saveFile]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="flex h-full bg-[#0a0a0f]">
      <div className="w-56 shrink-0 border-r border-[#1a1a24] overflow-hidden">
        <FileTree />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <EditorTabs />
        <div className="flex-1 overflow-hidden">
          <MonacoEditor onAutoSave={handleAutoSave} />
        </div>
        <StatusBar />
      </div>
    </div>
  );
}
