"use client";

import { useRef, useCallback } from "react";
import { RefreshCw, ExternalLink, Globe, Loader2 } from "lucide-react";
import { useWebContainerStore } from "@/lib/stores/webcontainer-store";

export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { previewUrl, status, isInstalling, isServerRunning } = useWebContainerStore();

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: previewUrl } }, "*");
    }
  }, [previewUrl]);

  const renderContent = () => {
    if (status === 'booting') {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-white/50 animate-spin mb-4" />
          <p className="text-sm text-zinc-400">Booting WebContainer...</p>
          <p className="mt-1 text-xs text-zinc-600">This may take a few seconds</p>
        </div>
      );
    }

    if (isInstalling) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-white/50 animate-spin mb-4" />
          <p className="text-sm text-zinc-400">Installing dependencies...</p>
          <p className="mt-1 text-xs text-zinc-600">Check terminal for progress</p>
        </div>
      );
    }

    if (status === 'starting' || (isServerRunning && !previewUrl)) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-white/50 animate-spin mb-4" />
          <p className="text-sm text-zinc-400">Starting dev server...</p>
          <p className="mt-1 text-xs text-zinc-600">Preview will appear shortly</p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-sm text-red-400">Failed to start</p>
          <p className="mt-1 text-xs text-zinc-600">Check terminal for errors</p>
        </div>
      );
    }

    if (previewUrl) {
      return (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="h-full w-full border-0"
          title="App Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          allow="cross-origin-isolated"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
          <Globe className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-400">Live preview will appear here</p>
        <p className="mt-1 text-xs text-zinc-600">Start the dev server to see preview</p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="flex h-10 items-center justify-between border-b border-white/[0.08] px-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-white/50" />
          <span className="text-xs font-medium text-zinc-400">Preview</span>
          {previewUrl && (
            <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">
              {previewUrl}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleRefresh}
            disabled={!previewUrl}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={handleOpenExternal}
            disabled={!previewUrl}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#080808] overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
