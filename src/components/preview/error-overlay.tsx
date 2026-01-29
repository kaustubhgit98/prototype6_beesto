"use client";

import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronRight, Copy, Check, ExternalLink } from "lucide-react";

interface ErrorOverlayProps {
  error: {
    message: string;
    stack?: string;
    file?: string;
    line?: number;
    column?: number;
  };
  onDismiss?: () => void;
  onFileClick?: (file: string, line?: number) => void;
}

export function ErrorOverlay({ error, onDismiss, onFileClick }: ErrorOverlayProps) {
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyError = async () => {
    const text = `${error.message}${error.stack ? `\n\n${error.stack}` : ""}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileLocation = error.file
    ? `${error.file}${error.line ? `:${error.line}` : ""}${error.column ? `:${error.column}` : ""}`
    : null;

  return (
    <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm z-50 flex items-center justify-center p-8 overflow-auto">
      <div className="max-w-2xl w-full bg-[#12121a] border border-red-500/20 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Runtime Error</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={copyError}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
              title="Copy error"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-red-300 font-mono text-sm leading-relaxed">
            {error.message}
          </div>

          {fileLocation && (
              <button
                onClick={() => onFileClick?.(error.file!, error.line)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors group"
              >
                <ExternalLink className="h-3.5 w-3.5 text-white" />
              <span>{fileLocation}</span>
              <span className="text-zinc-600 group-hover:text-zinc-400">Click to open</span>
            </button>
          )}

          {error.stack && (
            <div className="border border-[#1a1a24] rounded-lg overflow-hidden">
              <button
                onClick={() => setIsStackOpen(!isStackOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-[#12121a] hover:bg-[#1a1a24] transition-colors text-left"
              >
                {isStackOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                )}
                <span className="text-xs text-zinc-400">Stack Trace</span>
              </button>
              {isStackOpen && (
                <pre className="px-3 py-2 text-xs font-mono text-zinc-500 overflow-x-auto bg-[#0a0a0f] max-h-64 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-[#0a0a0f] border-t border-[#1a1a24]">
          <p className="text-xs text-zinc-600">
            Tip: Check the console for more details. Fix the error in your code to dismiss this overlay.
          </p>
        </div>
      </div>
    </div>
  );
}
