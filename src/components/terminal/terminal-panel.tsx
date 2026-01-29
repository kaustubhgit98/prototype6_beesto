"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal as TerminalIcon, X, Plus, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useWebContainerStore } from "@/lib/stores/webcontainer-store";

export function TerminalPanel() {
  const { toggleTerminal } = useUIStore();
  const { terminalOutput, clearOutput, status } = useWebContainerStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const fitAddonRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);

  useEffect(() => {
    let mounted = true;
    let resizeCleanup: (() => void) | undefined;

    const initTerminal = async () => {
      if (!xtermRef.current || terminalInstanceRef.current) return;

      const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');
        // @ts-expect-error - CSS import for xterm
        await import('@xterm/xterm/css/xterm.css');

      if (!mounted || !xtermRef.current) return;

      const terminal = new Terminal({
        theme: {
          background: '#080808',
          foreground: '#a1a1aa',
          cursor: '#ffffff',
          cursorAccent: '#080808',
          selectionBackground: '#ffffff33',
          black: '#18181b',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#60a5fa',
          magenta: '#d4d4d8',
          cyan: '#a1a1aa',
          white: '#f4f4f5',
          brightBlack: '#52525b',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#93c5fd',
          brightMagenta: '#e4e4e7',
          brightCyan: '#d4d4d8',
          brightWhite: '#fafafa',
        },
        fontFamily: "'Geist Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'bar',
        scrollback: 5000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      terminal.open(xtermRef.current);
      fitAddon.fit();

      terminal.writeln('\x1b[38;5;250m╭─────────────────────────────────────────╮\x1b[0m');
      terminal.writeln('\x1b[38;5;250m│\x1b[0m   \x1b[1;37mBEESTO Terminal\x1b[0m                        \x1b[38;5;250m│\x1b[0m');
      terminal.writeln('\x1b[38;5;250m│\x1b[0m   \x1b[2mWebContainer runtime v1.6\x1b[0m               \x1b[38;5;250m│\x1b[0m');
      terminal.writeln('\x1b[38;5;250m╰─────────────────────────────────────────╯\x1b[0m');
      terminal.writeln('');

      terminalInstanceRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const handleResize = () => fitAddon.fit();
      window.addEventListener('resize', handleResize);
      
      const resizeObserver = new ResizeObserver(() => fitAddon.fit());
      if (xtermRef.current) {
        resizeObserver.observe(xtermRef.current);
      }

      resizeCleanup = () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    };

    initTerminal();

    return () => {
      mounted = false;
      resizeCleanup?.();
      terminalInstanceRef.current?.dispose();
      terminalInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const terminal = terminalInstanceRef.current;
    if (!terminal || terminalOutput.length === 0) return;

    const lastOutput = terminalOutput[terminalOutput.length - 1];
    if (lastOutput) {
      terminal.write(lastOutput);
    }
  }, [terminalOutput]);

  useEffect(() => {
    fitAddonRef.current?.fit();
  }, []);

  const handleClear = useCallback(() => {
    terminalInstanceRef.current?.clear();
    clearOutput();
  }, [clearOutput]);

  const getStatusIndicator = () => {
    switch (status) {
      case 'booting':
        return <span className="text-zinc-400 text-xs">Booting...</span>;
      case 'installing':
        return <span className="text-zinc-400 text-xs">Installing...</span>;
      case 'starting':
        return <span className="text-zinc-400 text-xs">Starting...</span>;
      case 'ready':
        return <span className="text-emerald-400 text-xs">Ready</span>;
      case 'error':
        return <span className="text-red-400 text-xs">Error</span>;
      default:
        return <span className="text-zinc-500 text-xs">Idle</span>;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="flex h-9 items-center justify-between border-b border-white/[0.08] px-2">
        <div className="flex items-center">
          <div className="flex h-full items-center gap-2 bg-white/[0.03] rounded px-3 py-1.5 text-sm">
            <TerminalIcon className="h-3.5 w-3.5 text-white/50" />
            <span className="text-xs text-zinc-300">Terminal</span>
            <button 
              onClick={toggleTerminal}
              className="ml-1 rounded p-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
              aria-label="Close terminal"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <button 
            className="ml-1 rounded p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
            aria-label="New terminal"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="ml-3 px-2 py-0.5 rounded bg-white/[0.03]">
            {getStatusIndicator()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleClear}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded transition-colors"
            aria-label="Clear terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded transition-colors">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden bg-[#080808]">
        <div ref={xtermRef} className="h-full w-full p-1" />
      </div>
    </div>
  );
}
