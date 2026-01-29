"use client";

import { useState, useCallback, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import type { FileSystemTree } from "@webcontainer/api";

export type ContainerStatus = "idle" | "booting" | "ready" | "error";

interface UseWebContainerReturn {
  status: ContainerStatus;
  isReady: boolean;
  previewUrl: string | null;
  error: string | null;
  boot: () => Promise<void>;
  mountFiles: (files: FileSystemTree) => Promise<void>;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  readDirectory: (path: string) => Promise<string[]>;
  mkdir: (path: string) => Promise<void>;
  installDependencies: () => Promise<{ success: boolean }>;
  startDevServer: () => Promise<void>;
  executeCommand: (command: string, args?: string[]) => Promise<number>;
}

let webContainerInstance: WebContainer | null = null;

export function useWebContainer(onOutput?: (output: string) => void): UseWebContainerReturn {
  const [status, setStatus] = useState<ContainerStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const processRef = useRef<{ kill: () => void } | null>(null);

  const boot = useCallback(async () => {
    if (webContainerInstance) {
      setStatus("ready");
      return;
    }

    try {
      setStatus("booting");
      setError(null);
      webContainerInstance = await WebContainer.boot();
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to boot WebContainer");
      throw err;
    }
  }, []);

  const mountFiles = useCallback(async (files: FileSystemTree) => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }
    await webContainerInstance.mount(files);
  }, []);

  const writeFile = useCallback(async (path: string, content: string) => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }
    await webContainerInstance.fs.writeFile(path, content, { encoding: "utf-8" });
  }, []);

  const readFile = useCallback(async (path: string): Promise<string> => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }
    const content = await webContainerInstance.fs.readFile(path, { encoding: "utf-8" });
    return typeof content === "string" ? content : new TextDecoder().decode(content);
  }, []);

  const readDirectory = useCallback(async (path: string): Promise<string[]> => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }
    return await webContainerInstance.fs.readdir(path, { withFileTypes: true }).then(entries =>
      entries.map(entry => entry.name)
    );
  }, []);

  const mkdir = useCallback(async (path: string) => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }
    await webContainerInstance.fs.mkdir(path, { recursive: true });
  }, []);

  const installDependencies = useCallback(async (): Promise<{ success: boolean }> => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }

    const installProcess = await webContainerInstance.spawn("npm", ["install"]);
    
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput?.(data);
        },
      })
    );

    const exitCode = await installProcess.exit;
    return { success: exitCode === 0 };
  }, [onOutput]);

  const startDevServer = useCallback(async () => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }

    if (processRef.current) {
      processRef.current.kill();
    }

    const devProcess = await webContainerInstance.spawn("npm", ["run", "dev"]);
    processRef.current = devProcess;

    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput?.(data);
        },
      })
    );

    webContainerInstance.on("server-ready", (port, url) => {
      setPreviewUrl(url);
    });

    return new Promise<void>((resolve) => {
      const checkReady = setInterval(() => {
        if (previewUrl) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
    });
  }, [onOutput, previewUrl]);

  const executeCommand = useCallback(async (command: string, args: string[] = []): Promise<number> => {
    if (!webContainerInstance) {
      throw new Error("WebContainer not booted");
    }

    const process = await webContainerInstance.spawn(command, args);
    
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput?.(data);
        },
      })
    );

    return await process.exit;
  }, [onOutput]);

  return {
    status,
    isReady: status === "ready",
    previewUrl,
    error,
    boot,
    mountFiles,
    writeFile,
    readFile,
    readDirectory,
    mkdir,
    installDependencies,
    startDevServer,
    executeCommand,
  };
}

// WebContainer Manager - singleton for direct access
class WebContainerManager {
  private instance: WebContainer | null = null;
  private bootPromise: Promise<void> | null = null;

  async ensureBooted(): Promise<WebContainer> {
    if (this.instance) {
      return this.instance;
    }

    if (this.bootPromise) {
      await this.bootPromise;
      return this.instance!;
    }

    this.bootPromise = (async () => {
      this.instance = await WebContainer.boot();
    })();

    await this.bootPromise;
    return this.instance!;
  }

  async writeFile(path: string, content: string): Promise<void> {
    const container = await this.ensureBooted();
    await container.fs.writeFile(path, content, { encoding: "utf-8" });
  }

  async readFile(path: string): Promise<string> {
    const container = await this.ensureBooted();
    const content = await container.fs.readFile(path, { encoding: "utf-8" });
    return typeof content === "string" ? content : new TextDecoder().decode(content);
  }

  async readDirectory(path: string): Promise<string[]> {
    const container = await this.ensureBooted();
    const entries = await container.fs.readdir(path, { withFileTypes: true });
    return entries.map(entry => entry.name);
  }

  async isDirectory(path: string): Promise<boolean> {
    const container = await this.ensureBooted();
    try {
      // Try to read as directory - if it succeeds, it's a directory
      await container.fs.readdir(path);
      return true;
    } catch {
      // If readdir fails, it's likely a file
      return false;
    }
  }

  async mkdir(path: string): Promise<void> {
    const container = await this.ensureBooted();
    await container.fs.mkdir(path, { recursive: true });
  }

  async readAllFiles(): Promise<Record<string, string>> {
    const container = await this.ensureBooted();
    const files: Record<string, string> = {};

    const readDir = async (dirPath: string): Promise<void> => {
      const entries = await container.fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = dirPath === "/" ? `/${entry.name}` : `${dirPath}/${entry.name}`;
        
        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else {
          try {
            const content = await container.fs.readFile(fullPath, { encoding: "utf-8" });
            files[fullPath] = typeof content === "string" ? content : new TextDecoder().decode(content);
          } catch (err) {
            console.warn(`Failed to read file ${fullPath}:`, err);
          }
        }
      }
    };

    await readDir("/");
    return files;
  }

  async deleteFile(path: string): Promise<void> {
    const container = await this.ensureBooted();
    await container.fs.rm(path, { recursive: true });
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const container = await this.ensureBooted();
    await container.fs.rename(oldPath, newPath);
  }
}

export const webContainerManager = new WebContainerManager();
