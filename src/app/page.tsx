"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Loader2, RefreshCw, ExternalLink, Cloud, Send, Copy, Check, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function SecretDownloadPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "downloading" | "exporting">("loading");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [cloudUrl, setCloudUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(() => {
    setStatus("downloading");
    const downloadUrl = `${window.location.origin}/api/download-source?t=${Date.now()}`;
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: downloadUrl } }, "*");
    setTimeout(() => setStatus("ready"), 3000);
  }, []);

  const openExternalLink = (url: string) => {
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
  };

  const handleCloudExport = async (type: "bashupload" | "discord" | "transfer") => {
    if (type === "discord" && !webhookUrl) {
      toast.error("Please enter a Discord Webhook URL");
      return;
    }

    setStatus("exporting");
    try {
      const res = await fetch("/api/export-cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, webhookUrl }),
      });

      const data = await res.json();
      if (data.success) {
        if (type === "bashupload" || type === "transfer") {
          setCloudUrl(data.url);
          toast.success("Project uploaded to cloud!");
        } else {
          toast.success("Project sent to Discord!");
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Export failed");
    } finally {
      setStatus("ready");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  useEffect(() => {
    const timer = setTimeout(() => setStatus("ready"), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white selection:bg-white/30 p-4">
      <div className="relative flex flex-col items-center gap-8 p-8 max-w-lg w-full">
        <div className="absolute inset-0 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl shadow-2xl">
          {status === "loading" ? (
            <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
          ) : status === "exporting" || status === "downloading" ? (
            <RefreshCw className="h-8 w-8 text-white/60 animate-spin" />
          ) : (
            <Cloud className="h-8 w-8 text-white/60" />
          )}
        </div>

        <div className="text-center relative">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Project Export Center
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            If direct download fails, use the cloud options below to export your code to external services.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full relative">
          {/* Method 1: Direct Download */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Download className="h-3 w-3" /> Method 1: Direct Download
            </h2>
            <button
              onClick={handleDownload}
              disabled={status !== "ready"}
              className="group flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-bold text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {status === "downloading" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : (
                <><Download className="h-5 w-5" /> Download ZIP</>
              )}
            </button>
          </div>

          {/* Method 2: Cloud Link */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <ExternalLink className="h-3 w-3" /> Method 2: Cloud Export
            </h2>
            {cloudUrl ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <code className="text-[10px] text-zinc-400 truncate flex-1">{cloudUrl}</code>
                  <button
                    onClick={() => copyToClipboard(cloudUrl)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    title="Copy Link"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <button
                  onClick={() => openExternalLink(cloudUrl)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 font-bold text-black transition-all hover:bg-white/90"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Open Download Page</span>
                </button>

                <button
                  onClick={() => setCloudUrl(null)}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors text-center"
                >
                  Generate a different link
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCloudExport("bashupload")}
                  disabled={status !== "ready"}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-white/5 px-4 py-4 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {status === "exporting" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Cloud className="h-5 w-5" />
                      <span className="text-[10px]">BashUpload</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCloudExport("transfer")}
                  disabled={status !== "ready"}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-white/5 px-4 py-4 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {status === "exporting" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-[10px]">Transfer.sh</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="text-[10px] text-center text-zinc-600">Secure, anonymous cloud storage (expires in 3-14 days)</p>
          </div>

          {/* Method 3: Discord Webhook */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> Method 3: Discord Webhook
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Paste Discord Webhook URL..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                onClick={() => handleCloudExport("discord")}
                disabled={status !== "ready" || !webhookUrl}
                className="group flex items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-6 py-4 font-bold text-white transition-all hover:bg-[#4752C4] disabled:opacity-50"
              >
                {status === "exporting" ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-5 w-5" /> Send to Discord</>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-zinc-600">Private & permanent storage in your server</p>
          </div>
        </div>

        <div className="mt-4 pt-8 border-t border-white/5 w-full">
          <div className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium text-center">
            <span>Beesto Export v3.0</span>
            <span>Includes: src, public, config files</span>
          </div>
        </div>
      </div>
    </div>
  );
}
