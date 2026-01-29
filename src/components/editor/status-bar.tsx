"use client";

import { useEditorStore } from "@/lib/stores/editor-store";
import { GitBranch, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { SyncStatusIndicator } from "./sync-status-indicator";

export function StatusBar() {
  const { cursorPosition, openTabs, activeTabId } = useEditorStore();
  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const dirtyCount = openTabs.filter((t) => t.isDirty).length;

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1a1a24] bg-[#0a0a0f] px-3 text-[11px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        
        <SyncStatusIndicator />
        
        {dirtyCount > 0 && (
          <div className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{dirtyCount} unsaved</span>
          </div>
        )}
        
        {dirtyCount === 0 && openTabs.length > 0 && (
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            <span>All saved</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <span className="text-zinc-500">
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </span>
            <span className="text-zinc-500">
              {activeTab.language.charAt(0).toUpperCase() + activeTab.language.slice(1)}
            </span>
            <span className="text-zinc-500">UTF-8</span>
          </>
        )}
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <Bell className="h-3 w-3" />
        </button>
      </div>
    </footer>
  );
}
