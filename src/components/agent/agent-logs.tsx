"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Info, CheckCircle, AlertTriangle, XCircle, ChevronRight, LucideIcon } from "lucide-react";
import { useAgentStore } from "@/lib/stores/agent-store";

const logTypeConfig: Record<string, { icon: LucideIcon; color: string; prefix: string }> = {
  info: { icon: Info, color: "text-zinc-400", prefix: "INFO" },
  success: { icon: CheckCircle, color: "text-emerald-400", prefix: "SUCCESS" },
  warning: { icon: AlertTriangle, color: "text-amber-400", prefix: "WARN" },
  error: { icon: XCircle, color: "text-red-400", prefix: "ERROR" },
  step: { icon: ChevronRight, color: "text-white", prefix: "STEP" },
};

export function AgentLogs() {
  const { logs, state } = useAgentStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (state === "IDLE" && logs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mx-4 mb-4"
    >
      <div className="rounded-xl border border-[#1a1a24] bg-[#0a0a0f] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a24]">
          <Terminal className="size-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-500">Agent Logs</span>
          <span className="text-[10px] text-zinc-600 ml-auto">{logs.length} entries</span>
        </div>
        <div className="max-h-40 overflow-y-auto p-2 font-mono">
          <AnimatePresence mode="popLayout">
              {logs.map((log) => {
                const config = logTypeConfig[log.type] || logTypeConfig.info;
                return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 py-1 text-[11px]"
                >
                  <span className="text-zinc-600 shrink-0">
                    {log.timestamp.toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className={`shrink-0 ${config.color}`}>[{config.prefix}]</span>
                  <span className="text-zinc-400">{log.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>
    </motion.div>
  );
}
