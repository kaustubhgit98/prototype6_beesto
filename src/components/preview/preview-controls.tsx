"use client";

import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor, Globe } from "lucide-react";

export type DeviceView = "desktop" | "tablet" | "mobile";

interface PreviewControlsProps {
  deviceView: DeviceView;
  previewUrl: string | null;
  isRefreshing?: boolean;
  onDeviceChange: (view: DeviceView) => void;
  onRefresh: () => void;
}

export function PreviewControls({
  deviceView,
  previewUrl,
  isRefreshing = false,
  onDeviceChange,
  onRefresh,
}: PreviewControlsProps) {
  const openExternal = () => {
    if (previewUrl) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: previewUrl } }, "*");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {previewUrl && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#12121a] rounded-md mr-2 max-w-[200px]">
          <Globe className="h-3 w-3 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-500 truncate font-mono">{previewUrl}</span>
        </div>
      )}

      <button
        onClick={() => onDeviceChange("mobile")}
        className={`p-2 rounded-lg transition-colors ${
          deviceView === "mobile" ? "bg-[#1a1a24] text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="Mobile view (375px)"
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDeviceChange("tablet")}
        className={`p-2 rounded-lg transition-colors ${
          deviceView === "tablet" ? "bg-[#1a1a24] text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="Tablet view (768px)"
      >
        <Tablet className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDeviceChange("desktop")}
        className={`p-2 rounded-lg transition-colors ${
          deviceView === "desktop" ? "bg-[#1a1a24] text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="Desktop view (100%)"
      >
        <Monitor className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-[#1a1a24] mx-1" />

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
        title="Refresh preview"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </button>

      <button
        onClick={openExternal}
        disabled={!previewUrl}
        className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors disabled:opacity-50"
        title="Open in new tab"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
}
