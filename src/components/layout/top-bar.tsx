"use client";

import { useState, useCallback } from "react";
import { Share2, Play, Terminal, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/lib/stores/ui-store";
import { SettingsPanel } from "./settings-panel";
import { webContainerManager } from "@/lib/webcontainer";
import { LogoIcon } from "@/components/ui/logo";
import { UserButton } from "@clerk/nextjs";

export function TopBar() {
  const { isTerminalOpen, toggleTerminal } = useUIStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportProject = useCallback(async () => {
    setIsExporting(true);
    try {
      const files = await webContainerManager.readAllFiles();
      if (!files || Object.keys(files).length === 0) {
        console.error("No files to export");
        return;
      }

      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      for (const [path, content] of Object.entries(files)) {
        if (typeof content === "string") {
          zip.file(path, content);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beesto-project-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <header className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-black px-3">
      <div className="flex items-center gap-3">
        <Link 
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Back to home"
        >
          <LogoIcon size={18} />
          <span className="text-[13px] font-bold tracking-tight text-white uppercase">Beesto</span>
        </Link>
        <div className="h-4 w-px bg-white/[0.08]" />
        <span className="text-[12px] font-medium text-white/40">Untitled Project</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={toggleTerminal}
          className={`flex h-7 items-center gap-1.5 rounded border border-transparent px-2 text-[12px] font-medium transition-colors ${
            isTerminalOpen 
              ? "bg-white/[0.1] border-white/10 text-white" 
              : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
          }`}
          aria-label={isTerminalOpen ? "Hide terminal" : "Show terminal"}
          title="Toggle Terminal"
        >
          <Terminal className="h-3.5 w-3.5" />
        </button>
        
        <button 
          onClick={handleExportProject}
          disabled={isExporting}
          className="flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-50"
          aria-label="Export project"
          title="Download as ZIP"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>

        <button 
          className="flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
          aria-label="Share project"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-4 w-px bg-white/[0.08]" />
        
        <button 
          className="flex h-7 items-center gap-1.5 rounded bg-white px-3 text-[12px] font-bold text-black transition-opacity hover:opacity-90 active:scale-95"
          aria-label="Deploy project"
        >
          <Play className="h-3 w-3 fill-black" />
          DEPLOY
        </button>
        
        <SettingsPanel />

        <div className="mx-1 h-4 w-px bg-white/[0.08]" />
        
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "w-7 h-7 border border-white/10"
            }
          }}
        />
      </div>
    </header>
  );
}
