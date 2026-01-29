"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Key, AlertCircle, X, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CenterPanel } from "@/components/center/center-panel";
import { TerminalPanel } from "@/components/terminal/terminal-panel";
import { WebContainerProvider } from "@/components/providers/webcontainer-provider";
import { useUIStore } from "@/lib/stores/ui-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

function ApiKeyModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: () => void }) {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const { geminiApiKey, groqApiKey, setGeminiApiKey, setGroqApiKey, hasAnyApiKey } = useSettingsStore();

  const hasGeminiKey = geminiApiKey.trim() !== '';
  const hasGroqKey = groqApiKey.trim() !== '';

  const handleSave = () => {
    if (hasAnyApiKey()) {
      onSave();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0c0c10] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">API Keys Required</h2>
                  <p className="text-sm text-white/40">Configure at least one API key</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-400/80">
                  At least one API key is required. Gemini key for Gemini models, Groq key for LLaMA and DeepSeek models.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Key className="h-3.5 w-3.5" />
                  Gemini API Key
                  {hasGeminiKey && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-white/30">Used for Gemini models</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Key className="h-3.5 w-3.5" />
                  Groq API Key
                  {hasGroqKey && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showGroqKey ? "text" : "password"}
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                  >
                    {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-white/30">Used for LLaMA and DeepSeek models</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Go Back
              </button>
              <button
                onClick={handleSave}
                disabled={!hasAnyApiKey()}
                className="flex-1 px-4 py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {hasAnyApiKey() ? "Continue to IDE" : "Enter at least one key"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
  // Show loading state while auth is syncing
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-white/50">Authenticating...</p>
        </div>
      </div>
    );
  }

function EditorContent() {
  useKeyboardShortcuts();
  const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { hasAnyApiKey } = useSettingsStore();
  const { 
    isTerminalOpen, 
    chatWidth, 
    terminalHeight, 
    setChatWidth, 
    setTerminalHeight 
  } = useUIStore();
  
  const isDraggingChat = useRef(false);
  const isDraggingTerminal = useRef(false);

  // Sync auth state and ensure user is authenticated
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/");
      return;
    }
  }, [isLoaded, isSignedIn, router]);
  useEffect(() => {
    if (!hasAnyApiKey()) {
      setShowApiKeyModal(true);
    } else {
      setIsReady(true);
    }
  }, [hasAnyApiKey]);

  const handleChatMouseDown = useCallback(() => {
    isDraggingChat.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleTerminalMouseDown = useCallback(() => {
    isDraggingTerminal.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingChat.current) {
      setChatWidth(e.clientX);
    }
    if (isDraggingTerminal.current) {
      const container = e.currentTarget.getBoundingClientRect();
      setTerminalHeight(container.bottom - e.clientY);
    }
  }, [setChatWidth, setTerminalHeight]);

  const handleMouseUp = useCallback(() => {
    isDraggingChat.current = false;
    isDraggingTerminal.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleModalClose = () => {
    if (!hasAnyApiKey()) {
      router.push("/");
    } else {
      setShowApiKeyModal(false);
      setIsReady(true);
    }
  };

  const handleModalSave = () => {
    setShowApiKeyModal(false);
    setIsReady(true);
  };

  if (!isReady && !showApiKeyModal) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808]">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
      <div 
        className="flex h-screen flex-col overflow-hidden bg-[#080808]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TopBar />
        
        <div className="flex flex-1 overflow-hidden">
          <div style={{ width: chatWidth }} className="shrink-0 h-full">
            <ChatPanel />
          </div>
          
          <div 
            onMouseDown={handleChatMouseDown}
            className="w-1 bg-white/[0.08] hover:bg-white/30 cursor-col-resize transition-colors shrink-0"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat panel"
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div 
              className="flex-1 overflow-hidden" 
              style={{ height: isTerminalOpen ? `calc(100% - ${terminalHeight}px - 4px)` : "100%" }}
            >
              <CenterPanel />
            </div>
            
            {isTerminalOpen && (
              <>
                <div 
                  onMouseDown={handleTerminalMouseDown}
                  className="h-1 bg-white/[0.08] hover:bg-white/30 cursor-row-resize transition-colors shrink-0"
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize terminal panel"
                />
              <div style={{ height: terminalHeight }} className="shrink-0">
                <TerminalPanel />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default function EditorPage() {
  return (
    <WebContainerProvider autoInit={false}>
      <EditorContent />
    </WebContainerProvider>
  );
}
