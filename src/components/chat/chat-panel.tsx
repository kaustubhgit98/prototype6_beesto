"use client";

import { useRef, useEffect, useCallback } from "react";
import { Trash2, Download, Loader2, RotateCcw } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore, AI_MODELS, CUSTOM_MODEL } from "@/lib/stores/ui-store";
import { useAgentStore } from "@/lib/stores/agent-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AgentStatus, AgentPlanViewer, AgentReport, AgentLogs } from "@/components/agent";
import { useAgentLoop } from "@/hooks/use-agent-loop";
import { LogoIcon } from "@/components/ui/logo";

export function ChatPanel() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasSentPending = useRef(false);

  const { messages, isStreaming, chatMode, addMessage, appendToLastMessage, setLastMessageStreaming, clearMessages, exportConversation, getRecentMessages, pendingMessage, pendingModel, clearPendingMessage } = useChatStore();
  const { selectedModel, setAIStatus, setSelectedModel } = useUIStore();
  const { customApiKey } = useSettingsStore();
  const { state: agentState, isProcessing: agentProcessing, reset: resetAgent } = useAgentStore();
  const { runAgentLoop, rollback } = useAgentLoop();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageInternal = useCallback(
    async (content: string, modelId?: string) => {
      addMessage({ role: "user", content });

      if (chatMode === "agent") {
        addMessage({ role: "assistant", content: "Starting agent loop...", isStreaming: false });
        await runAgentLoop(content);
        return;
      }

      setAIStatus("thinking");
      addMessage({ role: "assistant", content: "", isStreaming: true });
      setLastMessageStreaming(true);

      const useModelId = modelId || selectedModel.id;
      const isCustom = useModelId === "custom-model";

      try {
        const recentMessages = getRecentMessages(10);
          const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: recentMessages.slice(0, -1).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              model: useModelId,
              temperature: 0.7,
              customApiKey: isCustom ? customApiKey : undefined,
            }),
          });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setAIStatus("streaming");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  appendToLastMessage(parsed.content);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "An error occurred";
        appendToLastMessage(`\n\n*Error: ${message}*`);
      } finally {
        setLastMessageStreaming(false);
        setAIStatus("idle");
      }
      },
      [addMessage, appendToLastMessage, setLastMessageStreaming, getRecentMessages, selectedModel.id, customApiKey, setAIStatus, chatMode, runAgentLoop]
    );

  const sendMessage = useCallback(
    (content: string) => {
      sendMessageInternal(content);
    },
    [sendMessageInternal]
  );

  useEffect(() => {
    if (pendingMessage && !hasSentPending.current) {
      hasSentPending.current = true;
      
      if (pendingModel) {
        const allModels = customApiKey ? [...AI_MODELS, CUSTOM_MODEL] : AI_MODELS;
        const model = allModels.find(m => m.id === pendingModel);
        if (model) {
          setSelectedModel(model);
        }
      }
      
      setTimeout(() => {
        sendMessageInternal(pendingMessage, pendingModel || undefined);
        clearPendingMessage();
      }, 100);
    }
  }, [pendingMessage, pendingModel, customApiKey, setSelectedModel, sendMessageInternal, clearPendingMessage]);

  const handleExport = useCallback(() => {
    const json = exportConversation();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportConversation]);

  return (
    <div className="flex h-full flex-col bg-black border-r border-white/[0.08]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <LogoIcon size={16} />
            <span className="text-[12px] font-bold tracking-tight text-white uppercase">Beesto AI</span>
            {chatMode === "agent" && agentState !== "IDLE" && (
              <AgentStatus />
            )}
          </div>
          <div className="flex items-center gap-1">
            {chatMode === "agent" && agentState === "FAILED" && (
              <button
                onClick={rollback}
                className="p-1.5 text-white/50 hover:text-white rounded transition-colors"
                title="Rollback changes"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={messages.length === 0}
              className="p-1.5 text-white/40 hover:text-white/70 rounded transition-colors disabled:opacity-20"
              title="Export conversation"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { clearMessages(); resetAgent(); }}
              disabled={messages.length === 0 && agentState === "IDLE"}
              className="p-1.5 text-white/40 hover:text-white/70 rounded transition-colors disabled:opacity-20"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-none">
        {chatMode === "agent" && (agentState !== "IDLE" || agentProcessing) && (
          <div className="pt-4 px-4">
            <AgentPlanViewer />
            <AgentReport />
            <AgentLogs />
          </div>
        )}
        
        <div className="p-4 space-y-6">
          {messages.length === 0 && agentState === "IDLE" ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-6">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center mb-6">
                <LogoIcon size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2 uppercase tracking-widest">Beesto AI</h3>
              <p className="text-[13px] text-white/40 max-w-[240px] leading-relaxed">
                {chatMode === "agent" 
                  ? "Describe your vision and the agent will engineer it from scratch."
                  : "How can I help you engineer your application today?"}
              </p>
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}
          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center shrink-0">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-bold text-white/40 uppercase tracking-wider">Engineering</span>
                <div className="flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-white/40 animate-pulse" />
                  <span className="h-1 w-1 rounded-full bg-white/40 animate-pulse delay-75" />
                  <span className="h-1 w-1 rounded-full bg-white/40 animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={agentProcessing} />
    </div>
  );
}
