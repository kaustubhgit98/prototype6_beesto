"use client";

import { useEffect, useRef, useMemo } from "react";
import { Terminal, Trash2, ChevronDown, ChevronRight, Info, AlertTriangle, XCircle, FileText } from "lucide-react";
import { useConsoleStore, type ConsoleFilter, type ConsoleLogEntry } from "@/lib/stores/console-store";

const FILTER_TABS: { id: ConsoleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "errors", label: "Errors" },
  { id: "warnings", label: "Warnings" },
];

function LogIcon({ type }: { type: ConsoleLogEntry["type"] }) {
  switch (type) {
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />;
    case "warn":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    case "info":
      return <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
  }
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function LogEntry({ log }: { log: ConsoleLogEntry }) {
  const typeColors: Record<ConsoleLogEntry["type"], string> = {
    log: "text-zinc-300",
    info: "text-blue-300",
    warn: "text-amber-300 bg-amber-500/5",
    error: "text-red-300 bg-red-500/5",
  };

  return (
    <div
      className={`flex items-start gap-2 px-3 py-1.5 font-mono text-xs border-b border-[#1a1a24] hover:bg-[#12121a] ${typeColors[log.type]}`}
    >
      <LogIcon type={log.type} />
      <span className="text-zinc-600 shrink-0">{formatTimestamp(log.timestamp)}</span>
      <div className="flex-1 min-w-0">
        <span className="whitespace-pre-wrap break-words">{log.message}</span>
        {log.source && (
          <span className="ml-2 text-zinc-600 text-[10px]">@ {log.source}</span>
        )}
        {log.stack && (
          <details className="mt-1">
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400 flex items-center gap-1">
              <ChevronRight className="h-3 w-3 inline details-open:hidden" />
              <ChevronDown className="h-3 w-3 hidden details-open:inline" />
              Stack trace
            </summary>
            <pre className="mt-1 text-[10px] text-zinc-500 overflow-x-auto whitespace-pre">
              {log.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface ConsolePanelProps {
  height?: number;
}

export function ConsolePanel({ height = 180 }: ConsolePanelProps) {
  const filter = useConsoleStore((s) => s.filter);
  const isAutoScroll = useConsoleStore((s) => s.isAutoScroll);
  const setFilter = useConsoleStore((s) => s.setFilter);
  const clearLogs = useConsoleStore((s) => s.clearLogs);
  const toggleAutoScroll = useConsoleStore((s) => s.toggleAutoScroll);
  const allLogs = useConsoleStore((s) => s.logs);
  
  const logs = useMemo(() => {
    switch (filter) {
      case "errors": return allLogs.filter((l) => l.type === "error");
      case "warnings": return allLogs.filter((l) => l.type === "warn");
      default: return allLogs;
    }
  }, [allLogs, filter]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const errorCount = useMemo(() => allLogs.filter((l) => l.type === "error").length, [allLogs]);
  const warnCount = useMemo(() => allLogs.filter((l) => l.type === "warn").length, [allLogs]);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, isAutoScroll]);

  return (
    <div className="flex flex-col bg-[#0a0a0f] border-t border-[#1a1a24]" style={{ height }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a24]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Terminal className="h-4 w-4" />
            <span className="text-xs font-medium">Console</span>
          </div>
          
          <div className="flex items-center gap-1 bg-[#12121a] rounded-md p-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  filter === tab.id
                    ? "bg-[#1a1a24] text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {tab.id === "errors" && errorCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">
                    {errorCount}
                  </span>
                )}
                {tab.id === "warnings" && warnCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">
                    {warnCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoScroll}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isAutoScroll ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Auto-scroll
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
            No console output yet
          </div>
        ) : (
          logs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
