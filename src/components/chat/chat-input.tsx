"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, ChevronUp, Zap, Sparkles, MessageSquare, Infinity } from "lucide-react";
import { useUIStore, AI_MODELS, CUSTOM_MODEL, AIModel } from "@/lib/stores/ui-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 4000;

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  const { selectedModel, setSelectedModel } = useUIStore();
  const { chatMode, setChatMode, isStreaming } = useChatStore();
  const { customApiKey } = useSettingsStore();

  const allModels = customApiKey ? [...AI_MODELS, CUSTOM_MODEL] : AI_MODELS;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || disabled || isStreaming) return;
      onSend(input.trim());
      setInput("");
    },
    [input, disabled, isStreaming, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const getSpeedIcon = (speed: AIModel["speed"]) => {
    switch (speed) {
      case "ultra-fast":
        return <Zap className="size-3.5 text-white" />;
      case "very-fast":
        return <Zap className="size-3.5 text-white/60" />;
      default:
        return <Zap className="size-3.5 text-white/30" />;
    }
  };

  const isDisabled = disabled || isStreaming;
  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;

  const currentModel = mounted ? selectedModel : AI_MODELS[0];
  const currentMode = mounted ? chatMode : "chat";

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08]">
      <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 transition-colors focus-within:border-white/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS + 100))}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to engineer?"
          disabled={isDisabled}
          rows={1}
          className="w-full resize-none bg-transparent text-[13px] text-white placeholder-white/20 focus:outline-none min-h-[40px] max-h-[200px] py-1 disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/[0.04]">
          {/* Left side: Mode, Model, Attachment */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Chat/Agent Mode Toggle */}
            <div className="relative shrink-0" ref={modeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsModeOpen(!isModeOpen)}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-md transition-colors disabled:opacity-50"
              >
                {currentMode === "chat" ? (
                  <MessageSquare className="size-3" />
                ) : (
                  <Infinity className="size-3" />
                )}
                <span>{currentMode}</span>
                <ChevronUp
                  className={`size-3 transition-transform ${isModeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isModeOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-36 overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setChatMode("chat");
                      setIsModeOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.05] ${
                      currentMode === "chat" ? "bg-white/[0.08] text-white" : "text-white/40"
                    }`}
                  >
                    <MessageSquare className="size-3" />
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChatMode("agent");
                      setIsModeOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.05] ${
                      currentMode === "agent" ? "bg-white/[0.08] text-white" : "text-white/40"
                    }`}
                  >
                    <Infinity className="size-3" />
                    Agent
                  </button>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="relative shrink-0" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsModelOpen(!isModelOpen)}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-md transition-colors disabled:opacity-50"
              >
                {getSpeedIcon(currentModel.speed)}
                <span className="max-w-[100px] truncate">{currentModel.name}</span>
                <ChevronUp
                  className={`size-3 transition-transform ${isModelOpen ? "rotate-180" : ""}`}
                />
              </button>

{isModelOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 max-h-[300px] overflow-y-auto scrollbar-none">
                    <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Available Intelligence</span>
                    </div>
                    {allModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] ${
                          currentModel.id === model.id ? "bg-white/[0.08]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center shrink-0 ${model.isCustom ? "border-amber-500/30" : ""}`}>
                            {model.isCustom ? <Sparkles className="size-3.5 text-amber-400" /> : getSpeedIcon(model.speed)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-[12px] font-bold text-white truncate uppercase tracking-tight">{model.name}</div>
                            <div className="text-[10px] text-white/30 font-medium">
                              {model.provider} · {model.contextWindow}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Attachment Button */}
            <button
              type="button"
              disabled={isDisabled}
              className="shrink-0 p-1.5 text-white/30 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-md transition-colors disabled:opacity-50"
              title="Attach file"
            >
              <Paperclip className="size-3.5" />
            </button>
          </div>

          {/* Right side: Char count + Send */}
          <div className="flex items-center gap-2 shrink-0">
            {charCount > MAX_CHARS * 0.8 && (
              <span
                className={`text-[10px] font-bold tabular-nums ${isOverLimit ? "text-red-500" : "text-white/20"}`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            )}
            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isDisabled || isOverLimit}
              className="group flex items-center justify-center h-8 px-4 rounded-md bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
