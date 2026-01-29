"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Type, Save, Eye, WrapText, Hash, Key, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSettingsStore, type FontSize } from "@/lib/stores/settings-store";
import { useUIStore, AI_MODELS } from "@/lib/stores/ui-store";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  
  const {
    fontSize,
    autoSaveEnabled,
    autoSaveDelay,
    lineNumbers,
    minimap,
    wordWrap,
    geminiApiKey,
    groqApiKey,
    setFontSize,
    setAutoSaveEnabled,
    setAutoSaveDelay,
    setLineNumbers,
    setMinimap,
    setWordWrap,
    setGeminiApiKey,
    setGroqApiKey,
  } = useSettingsStore();

  const { selectedModel, setSelectedModel } = useUIStore();

  const fontSizes: FontSize[] = [12, 14, 16, 18];
  const delays: { value: 500 | 1000 | 2000; label: string }[] = [
    { value: 500, label: "500ms" },
    { value: 1000, label: "1s" },
    { value: 2000, label: "2s" },
  ];

  const hasGeminiKey = geminiApiKey.trim() !== '';
  const hasGroqKey = groqApiKey.trim() !== '';
  const hasAnyKey = hasGeminiKey || hasGroqKey;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-80 border-l border-[#1a1a24] bg-[#0c0c10] shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#1a1a24] px-4 py-3">
                <h2 className="font-semibold text-zinc-200">Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {!hasAnyKey && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-400">API Key Required</p>
                        <p className="text-xs text-amber-400/70 mt-1">
                          At least one API key is required to use the IDE.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <section className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    API Keys
                    {hasAnyKey && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </h3>
                  
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
                          className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-white/40 focus:outline-none transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGeminiKey(!showGeminiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Used for Gemini models
                      </p>
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
                          className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-white/40 focus:outline-none transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGroqKey(!showGroqKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Used for LLaMA and DeepSeek models
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Editor</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                      <Type className="h-3.5 w-3.5" />
                      Font Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {fontSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            fontSize === size
                              ? "border-white/40 bg-white/10 text-white"
                              : "border-[#2a2a3a] bg-[#0a0a0f] text-zinc-400 hover:bg-[#1a1a24]"
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <ToggleOption
                    icon={Hash}
                    label="Line Numbers"
                    checked={lineNumbers}
                    onChange={setLineNumbers}
                  />
                  
                  <ToggleOption
                    icon={Eye}
                    label="Minimap"
                    checked={minimap}
                    onChange={setMinimap}
                  />
                  
                  <ToggleOption
                    icon={WrapText}
                    label="Word Wrap"
                    checked={wordWrap}
                    onChange={setWordWrap}
                  />
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Auto-Save</h3>
                  
                  <ToggleOption
                    icon={Save}
                    label="Enable Auto-Save"
                    checked={autoSaveEnabled}
                    onChange={setAutoSaveEnabled}
                  />
                  
                  {autoSaveEnabled && (
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Delay</label>
                      <div className="grid grid-cols-3 gap-2">
                        {delays.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setAutoSaveDelay(value)}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                              autoSaveDelay === value
                                ? "border-white/40 bg-white/10 text-white"
                                : "border-[#2a2a3a] bg-[#0a0a0f] text-zinc-400 hover:bg-[#1a1a24]"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">AI Model</h3>
                  <div className="space-y-2">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedModel.id === model.id
                            ? "border-white/40 bg-white/10"
                            : "border-[#2a2a3a] bg-[#0a0a0f] hover:bg-[#1a1a24]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            selectedModel.id === model.id ? "text-white" : "text-zinc-300"
                          }`}>
                            {model.name}
                          </span>
                          <span className="text-xs text-zinc-500">{model.contextWindow}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-500">{model.provider}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {model.speed}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3 pt-2">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Shortcuts</h3>
                  <div className="space-y-2 text-xs">
                    <ShortcutRow label="Save File" keys={["⌘", "S"]} />
                    <ShortcutRow label="Toggle Chat" keys={["⌘", "K"]} />
                    <ShortcutRow label="Toggle Terminal" keys={["⌘", "`"]} />
                    <ShortcutRow label="Close Tab" keys={["⌘", "W"]} />
                    <ShortcutRow label="Next Tab" keys={["⌘", "Tab"]} />
                    <ShortcutRow label="Preview" keys={["⌘", "1"]} />
                    <ShortcutRow label="Code" keys={["⌘", "2"]} />
                    <ShortcutRow label="Close Modal" keys={["Esc"]} />
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleOption({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-3 py-2.5 transition-colors hover:bg-[#1a1a24]"
    >
      <span className="flex items-center gap-2 text-sm text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-white" : "bg-zinc-700"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform ${
            checked ? "left-[18px] bg-black" : "left-0.5 bg-white"
          }`}
        />
      </div>
    </button>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-zinc-400">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
