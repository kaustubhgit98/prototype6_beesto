"use client";

import { FileCode, GitBranch, Circle, MessageSquare } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

export function StatusBar() {
  const { isChatOpen, toggleChat } = useUIStore();

  return (
    <footer className="flex h-6 items-center justify-between border-t border-white/[0.08] bg-black px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
          <span>System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <FileCode className="h-3 w-3" />
          <span>TSX</span>
        </div>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <button
          onClick={toggleChat}
          className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:text-white ${
            isChatOpen ? "text-white" : ""
          }`}
        >
          <MessageSquare className="h-3 w-3" />
          <span>⌘K</span>
        </button>
      </div>
    </footer>
  );
}
