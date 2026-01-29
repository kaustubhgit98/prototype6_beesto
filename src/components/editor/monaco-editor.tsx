"use client";

import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, OnChange, loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { Loader2, Code2 } from "lucide-react";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
});

const modelCache = new Map<string, editor.ITextModel>();

export function disposeModelForPath(path: string) {
  const model = modelCache.get(path);
  if (model && !model.isDisposed()) {
    model.dispose();
  }
  modelCache.delete(path);
}

export function disposeAllModels() {
  modelCache.forEach((model) => {
    if (!model.isDisposed()) {
      model.dispose();
    }
  });
  modelCache.clear();
}

interface MonacoEditorProps {
  onAutoSave?: (content: string) => void;
}

export function MonacoEditor({ onAutoSave }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    openTabs, 
    activeTabId, 
    updateTabContent, 
    saveFile, 
    setCursorPosition,
    closeTab,
    switchToNextTab 
  } = useEditorStore();

  const { fontSize, lineNumbers, minimap, wordWrap } = useSettingsStore();
  
  const activeTab = openTabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize,
        lineNumbers: lineNumbers ? "on" : "off",
        minimap: { enabled: minimap },
        wordWrap: wordWrap ? "on" : "off",
      });
    }
  }, [fontSize, lineNumbers, minimap, wordWrap]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme("orchids-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A737D", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#0A0A0F",
        "editor.foreground": "#E4E4E7",
        "editor.lineHighlightBackground": "#12121a",
        "editor.selectionBackground": "#8B5CF640",
        "editorCursor.foreground": "#A78BFA",
        "editorLineNumber.foreground": "#52525B",
        "editorLineNumber.activeForeground": "#A1A1AA",
        "editor.inactiveSelectionBackground": "#8B5CF620",
        "editorIndentGuide.background": "#1a1a24",
        "editorIndentGuide.activeBackground": "#27272a",
      },
    });

    monaco.editor.setTheme("orchids-dark");

    editor.updateOptions({
      fontFamily: "'Geist Mono', 'Fira Code', monospace",
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: true, scale: 1, showSlider: "mouseover" },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      padding: { top: 16, bottom: 16 },
      scrollBeyondLastLine: false,
      renderLineHighlight: "all",
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showModules: true,
        preview: true,
        insertMode: "replace",
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      wordWrap: "on",
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeTabId) {
        saveFile(activeTabId);
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      if (activeTabId) {
        closeTab(activeTabId);
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Tab, () => {
      switchToNextTab();
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
    });
  }, [activeTabId, saveFile, closeTab, switchToNextTab, setCursorPosition]);

  const handleChange: OnChange = useCallback(
    (value) => {
      if (!activeTabId || value === undefined) return;
      
      updateTabContent(activeTabId, value);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        onAutoSave?.(value);
      }, 500);
    },
    [activeTabId, updateTabContent, onAutoSave]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  if (!activeTab) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0a0a0f]">
        <Code2 className="h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-300 text-lg font-medium">No file open</p>
        <p className="mt-1 text-zinc-500 text-sm">Select a file from the explorer to start editing</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={activeTab.language}
      value={activeTab.content}
      onChange={handleChange}
      onMount={handleEditorMount}
      loading={
          <div className="flex h-full items-center justify-center bg-[#080808]">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      }
      options={{
        readOnly: false,
        domReadOnly: false,
      }}
    />
  );
}

