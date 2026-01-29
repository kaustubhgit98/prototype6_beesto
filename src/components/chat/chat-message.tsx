"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, FileCode, Play, Loader2 } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types";
import { LogoIcon } from "@/components/ui/logo";
import { webContainerManager } from "@/lib/webcontainer";
import { useFileTreeStore } from "@/lib/stores/file-tree-store";
import { useEditorStore } from "@/lib/stores/editor-store";

interface ChatMessageProps {
  message: ChatMessageType;
}

interface FileCodeBlockProps {
  filePath: string;
  language: string;
  children: string;
}

function FileCodeBlock({ filePath, language, children }: FileCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const { refreshTree } = useFileTreeStore();
  const { openFile } = useEditorStore();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  const handleApply = useCallback(async () => {
    setApplying(true);
    try {
      let normalizedPath = filePath;
      if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.slice(1);
      }
      
      const parts = normalizedPath.split('/');
      if (parts.length > 1) {
        const dirPath = parts.slice(0, -1).join('/');
        await webContainerManager.mkdir(dirPath);
      }
      
      await webContainerManager.writeFile(normalizedPath, children);
      await refreshTree();
      
      openFile({
        path: '/' + normalizedPath,
        name: parts[parts.length - 1],
        type: 'file',
        language: language || 'typescript',
      });
      
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    } catch (error) {
      console.error('Failed to apply file:', error);
    } finally {
      setApplying(false);
    }
  }, [filePath, children, language, refreshTree, openFile]);

  return (
    <div className="relative group my-4 rounded-lg border border-white/10 overflow-hidden bg-black">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-white/40" />
          <span className="text-[11px] text-white/60 font-mono">{filePath}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-white/40 hover:text-white rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleApply}
            disabled={applying || applied}
            className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white text-black rounded hover:bg-zinc-200 disabled:opacity-50 transition-all"
            title="Apply file"
          >
            {applying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : applied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {applied ? "Applied" : "Apply"}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || "typescript"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "12px",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

interface RegularCodeBlockProps {
  language: string;
  children: string;
}

function RegularCodeBlock({ language, children }: RegularCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative group my-3 rounded-lg border border-white/10 overflow-hidden bg-black">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/10">
        <span className="text-[10px] text-white/40 font-mono uppercase">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 text-white/40 hover:text-white rounded transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "typescript"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "12px",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        isUser ? "bg-white/10" : "bg-white/5"
      }`}>
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white/60" />
        ) : (
          <LogoIcon size={16} />
        )}
      </div>
      
      <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block max-w-full text-left ${
          isUser 
            ? "bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5" 
            : ""
        }`}>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\S+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");
                  
                  // Check if this is an inline code
                  const isInline = !className && !codeContent.includes('\n');
                  
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  // Parse filename from language string (e.g., "filename:src/app/page.tsx")
                  let language = match ? match[1] : "";
                  let filePath = "";
                  
                  if (language.startsWith("filename:")) {
                    filePath = language.replace("filename:", "");
                    // Extract language from file extension
                    const ext = filePath.split(".").pop() || "";
                    const extToLang: Record<string, string> = {
                      tsx: "tsx",
                      ts: "typescript",
                      jsx: "jsx",
                      js: "javascript",
                      css: "css",
                      html: "html",
                      json: "json",
                      md: "markdown",
                      py: "python",
                    };
                    language = extToLang[ext] || ext;
                  }
                  
                  if (filePath) {
                    return (
                      <FileCodeBlock filePath={filePath} language={language}>
                        {codeContent}
                      </FileCodeBlock>
                    );
                  }
                  
                  return (
                    <RegularCodeBlock language={language}>
                      {codeContent}
                    </RegularCodeBlock>
                  );
                },
                p({ children }) {
                  return <p className="text-[13px] text-white/80 leading-relaxed mb-3 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="text-[13px] text-white/80 list-disc pl-4 mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="text-[13px] text-white/80 list-decimal pl-4 mb-3 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-[13px] text-white/80">{children}</li>;
                },
                h1({ children }) {
                  return <h1 className="text-lg font-bold text-white mb-3 mt-4">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-base font-bold text-white mb-2 mt-3">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-bold text-white mb-2 mt-3">{children}</h3>;
                },
                a({ href, children }) {
                  return (
                    <a href={href} className="text-white underline hover:text-white/80" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return <blockquote className="border-l-2 border-white/20 pl-3 italic text-white/60">{children}</blockquote>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
