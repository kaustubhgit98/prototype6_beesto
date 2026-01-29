"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { useConsoleStore } from "@/lib/stores/console-store";

export type PreviewStatus = "initializing" | "installing" | "starting" | "ready" | "error";

interface PreviewFrameProps {
  url: string | null;
  status: PreviewStatus;
  error?: string | null;
  deviceWidth?: string;
  refreshKey?: number;
  onRetry?: () => void;
}

export function PreviewFrame({
  url,
  status,
  error,
  deviceWidth = "w-full",
  refreshKey = 0,
  onRetry,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const addLog = useConsoleStore((s) => s.addLog);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const injectConsoleInterceptor = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    try {
      const script = `
        (function() {
          const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
          };

          function sendToParent(type, args) {
            try {
              const message = Array.from(args).map(arg => {
                if (arg instanceof Error) return arg.stack || arg.message;
                if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
                return String(arg);
              }).join(' ');
              
              window.parent.postMessage({
                type: 'CONSOLE_LOG',
                payload: { type, message }
              }, '*');
            } catch (e) {}
          }

          console.log = function(...args) {
            sendToParent('log', args);
            originalConsole.log.apply(console, args);
          };
          console.info = function(...args) {
            sendToParent('info', args);
            originalConsole.info.apply(console, args);
          };
          console.warn = function(...args) {
            sendToParent('warn', args);
            originalConsole.warn.apply(console, args);
          };
          console.error = function(...args) {
            sendToParent('error', args);
            originalConsole.error.apply(console, args);
          };

          window.addEventListener('error', function(e) {
            window.parent.postMessage({
              type: 'CONSOLE_LOG',
              payload: {
                type: 'error',
                message: e.message,
                stack: e.error?.stack,
                source: e.filename + ':' + e.lineno + ':' + e.colno
              }
            }, '*');
          });

          window.addEventListener('unhandledrejection', function(e) {
            window.parent.postMessage({
              type: 'CONSOLE_LOG',
              payload: {
                type: 'error',
                message: 'Unhandled Promise Rejection: ' + (e.reason?.message || e.reason)
              }
            }, '*');
          });
        })();
      `;

      const scriptEl = iframe.contentDocument?.createElement("script");
      if (scriptEl && iframe.contentDocument) {
        scriptEl.textContent = script;
        iframe.contentDocument.head?.appendChild(scriptEl);
      }
    } catch {
      // Cross-origin restriction - use postMessage fallback
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CONSOLE_LOG") {
        const { type, message, stack, source } = event.data.payload;
        addLog({ type, message, stack, source });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addLog]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    injectConsoleInterceptor();
  }, [injectConsoleInterceptor]);

  useEffect(() => {
    setIframeLoaded(false);
  }, [url, refreshKey]);

  if (status === "error" && error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#12121a] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-200 mb-2">Preview Error</h3>
        <p className="text-sm text-zinc-400 max-w-md mb-6 font-mono">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black text-sm font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (status === "initializing" || status === "installing" || status === "starting" || !url) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#12121a] text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-white relative" />
        </div>
        <p className="text-zinc-300 text-sm font-medium mb-1">
          {status === "initializing" && "Initializing environment..."}
          {status === "installing" && "Installing dependencies..."}
          {status === "starting" && "Starting dev server..."}
          {!url && status === "ready" && "Waiting for preview URL..."}
        </p>
        <p className="text-zinc-600 text-xs">This may take a moment</p>
      </div>
    );
  }

  return (
    <div className={`h-full ${deviceWidth} mx-auto bg-white rounded-lg overflow-hidden shadow-2xl relative`}>
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#12121a] z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={`${url}-${refreshKey}`}
        src={url}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        title="App Preview"
      />
    </div>
  );
}
