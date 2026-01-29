"use client";

import { useState, useCallback, useMemo } from "react";
import { AppWindow, Code2, Database, CreditCard, BarChart3 } from "lucide-react";
import { useUIStore, CenterTab } from "@/lib/stores/ui-store";
import { useWebContainerStore } from "@/lib/stores/webcontainer-store";
import { useConsoleStore } from "@/lib/stores/console-store";
import { EditorPanel } from "@/components/editor/editor-panel";
import { PreviewFrame, type PreviewStatus } from "@/components/preview/preview-frame";
import { PreviewControls, type DeviceView } from "@/components/preview/preview-controls";
import { ConsolePanel } from "@/components/preview/console-panel";
import { ErrorOverlay } from "@/components/preview/error-overlay";

const TABS: { id: CenterTab; label: string; icon: typeof AppWindow }[] = [
  { id: "app", label: "App", icon: AppWindow },
  { id: "code", label: "Code", icon: Code2 },
  { id: "database", label: "Database", icon: Database },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const CONSOLE_HEIGHT = 180;

export function CenterPanel() {
  const { activeTab, setActiveTab, previewUrl } = useUIStore();
  const { status: containerStatus, error: containerError } = useWebContainerStore();
  const allLogs = useConsoleStore((s) => s.logs);
  const errorLogs = useMemo(() => allLogs.filter((l) => l.type === "error"), [allLogs]);
  
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const previewStatus: PreviewStatus = useMemo(() => {
    if (containerError) return "error";
    if (containerStatus === "idle" || containerStatus === "booting") return "initializing";
    if (containerStatus === "installing") return "installing";
    if (containerStatus === "starting") return previewUrl ? "ready" : "starting";
    if (containerStatus === "ready") return previewUrl ? "ready" : "starting";
    return "initializing";
  }, [containerStatus, containerError, previewUrl]);

  const deviceWidth = useMemo(() => {
    switch (deviceView) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      default: return "w-full";
    }
  }, [deviceView]);

  const latestError = useMemo(() => {
    const recent = errorLogs[errorLogs.length - 1];
    if (!recent || recent.id === dismissedError) return null;
    return {
      message: recent.message,
      stack: recent.stack,
      file: recent.source?.split(":")[0],
      line: recent.source ? parseInt(recent.source.split(":")[1]) : undefined,
    };
  }, [errorLogs, dismissedError]);

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-2 h-11">
        <div className="flex h-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors relative h-full ${
                  isActive
                    ? "text-white bg-white/[0.03]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "app" && (
          <PreviewControls
            deviceView={deviceView}
            previewUrl={previewUrl}
            isRefreshing={isRefreshing}
            onDeviceChange={setDeviceView}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === "app" && (
          <>
            <div 
              className="flex-1 flex items-center justify-center bg-black p-4 relative overflow-hidden"
            >
              <PreviewFrame
                url={previewUrl}
                status={previewStatus}
                error={containerError}
                deviceWidth={deviceWidth}
                refreshKey={refreshKey}
                onRetry={handleRefresh}
              />
              
              {latestError && previewStatus === "ready" && (
                <ErrorOverlay
                  error={latestError}
                  onDismiss={() => setDismissedError(errorLogs[errorLogs.length - 1]?.id || null)}
                />
              )}
            </div>
            
            {isConsoleOpen && <ConsolePanel height={CONSOLE_HEIGHT} />}
            
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="absolute bottom-0 right-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white bg-black rounded-t border border-b-0 border-white/[0.08] transition-colors z-10"
              style={{ bottom: isConsoleOpen ? CONSOLE_HEIGHT : 0 }}
            >
              {isConsoleOpen ? "Hide Console" : "Show Console"}
            </button>
          </>
        )}

        {activeTab === "code" && <EditorPanel />}

        {activeTab === "database" && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Database className="h-10 w-10 text-white/10 mb-6" />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-[0.2em]">Database Explorer</h3>
            <p className="text-[12px] text-white/40 max-w-[300px] leading-relaxed">
              Connect to your persistence layer to engineer data models and relationships.
            </p>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <CreditCard className="h-10 w-10 text-white/10 mb-6" />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-[0.2em]">Transaction Engine</h3>
            <p className="text-[12px] text-white/40 max-w-[300px] leading-relaxed">
              Integrate secure payment flows and subscription management.
            </p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-10 w-10 text-white/10 mb-6" />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-[0.2em]">Systems Analysis</h3>
            <p className="text-[12px] text-white/40 max-w-[300px] leading-relaxed">
              Monitor system health, performance metrics, and telemetry data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
