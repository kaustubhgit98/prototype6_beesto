"use client";

import { createContext, useContext, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useWebContainer } from '@/lib/webcontainer';
import { useWebContainerStore } from '@/lib/stores/webcontainer-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { DEFAULT_FILES } from '@/lib/webcontainer/templates';
import type { ContainerStatus } from '@/lib/webcontainer';

interface WebContainerContextValue {
  status: ContainerStatus;
  isReady: boolean;
  previewUrl: string | null;
  error: string | null;
  initializeProject: () => Promise<void>;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  executeCommand: (command: string, args?: string[]) => Promise<number>;
}

const WebContainerContext = createContext<WebContainerContextValue | null>(null);

export function useWebContainerContext() {
  const context = useContext(WebContainerContext);
  if (!context) {
    throw new Error('useWebContainerContext must be used within WebContainerProvider');
  }
  return context;
}

interface WebContainerProviderProps {
  children: ReactNode;
  autoInit?: boolean;
}

export function WebContainerProvider({ children, autoInit = false }: WebContainerProviderProps) {
  const { setPreviewUrl: setUIPreviewUrl } = useUIStore();
  const { 
    setStatus, 
    setPreviewUrl, 
    setError, 
    appendOutput,
    setInstalling,
    setServerRunning,
  } = useWebContainerStore();
  
  const initializedRef = useRef(false);

  const handleOutput = useCallback((output: string) => {
    appendOutput(output);
  }, [appendOutput]);

  const {
    status,
    isReady,
    previewUrl: wcPreviewUrl,
    error,
    boot,
    mountFiles,
    writeFile,
    readFile,
    installDependencies,
    startDevServer,
    executeCommand,
  } = useWebContainer(handleOutput);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  useEffect(() => {
    if (wcPreviewUrl) {
      setPreviewUrl(wcPreviewUrl);
      setUIPreviewUrl(wcPreviewUrl);
    }
  }, [wcPreviewUrl, setPreviewUrl, setUIPreviewUrl]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  const initializeProject = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      await boot();
      await mountFiles(DEFAULT_FILES);

      setInstalling(true);
      const { success } = await installDependencies();
      setInstalling(false);

      if (success) {
        setServerRunning(true);
        await startDevServer();
      }
    } catch (e) {
      initializedRef.current = false;
      setError(e instanceof Error ? e.message : 'Failed to initialize');
      setInstalling(false);
    }
  }, [boot, mountFiles, installDependencies, startDevServer, setError, setInstalling, setServerRunning]);

  useEffect(() => {
    if (autoInit && !initializedRef.current) {
      initializeProject();
    }
  }, [autoInit, initializeProject]);

  const value: WebContainerContextValue = {
    status,
    isReady,
    previewUrl: wcPreviewUrl,
    error,
    initializeProject,
    writeFile,
    readFile,
    executeCommand,
  };

  return (
    <WebContainerContext.Provider value={value}>
      {children}
    </WebContainerContext.Provider>
  );
}
