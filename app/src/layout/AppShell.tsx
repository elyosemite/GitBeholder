import { Profiler } from "react";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import { TabBar } from "./tabs/TabBar";
import { SettingsView } from "./settings/SettingsView";
import { LauncherView } from "./launcher/LauncherView";
import { RepositoryOverviewColumn } from "./columns/RepositoryOverviewColumn";
import { CommitsColumn } from "./columns/CommitsColumn";
import { GraphColumn } from "./columns/GraphColumn";
import { ChangesColumn } from "./columns/ChangesColumn";
import { CommitPanel } from "./panel/CommitPanel";
import { useSessionValue } from "@/features/session";
import { useRestoreLastRepository, useTabs } from "@/features/tabs";
import { useTrackRepositoryOpened } from "@/features/repositories";
import { useWorkbenchLayout, useWorkbenchShortcuts } from "@/features/workbench";
import { useResizableHeight } from "@/lib/hooks/useResizableHeight";
import { useResizableWidth } from "@/lib/hooks/useResizableWidth";
import { useZoom } from "@/lib/hooks/useZoom";
import { onRender } from "@/lib/perf";

const CHANGES_COLUMN_DEFAULT_WIDTH = 288; // matches the previous fixed w-72
const CHANGES_COLUMN_MAX_WIDTH = 480;
// The overview column can grow but never get narrower than its original
// fixed width (w-72), which its lists are laid out for.
const OVERVIEW_COLUMN_MIN_WIDTH = 288;
const OVERVIEW_COLUMN_MAX_WIDTH = 480;
const PANEL_DEFAULT_HEIGHT = 320;
const PANEL_MIN_HEIGHT = 160;
const PANEL_MAX_HEIGHT = 720;

function ColumnResizeHandle({ onPointerDown }: { onPointerDown: (event: React.PointerEvent) => void }) {
  return (
    <div
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize"
      className="w-1 flex-none h-full cursor-col-resize bg-line-subtle hover:bg-accent active:bg-accent"
    />
  );
}

function PanelResizeHandle({ onPointerDown }: { onPointerDown: (event: React.PointerEvent) => void }) {
  return (
    <div
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="horizontal"
      title="Drag to resize"
      className="h-1 w-full flex-none cursor-row-resize bg-line-subtle hover:bg-accent active:bg-accent"
    />
  );
}

export function AppShell() {
  const mainView = useSessionValue((s) => s.mainView);
  const { width: changesWidth, onPointerDown } = useResizableWidth(
    CHANGES_COLUMN_DEFAULT_WIDTH,
    0,
    CHANGES_COLUMN_MAX_WIDTH,
  );
  const { width: overviewWidth, onPointerDown: onOverviewResizeStart } = useResizableWidth(
    OVERVIEW_COLUMN_MIN_WIDTH,
    OVERVIEW_COLUMN_MIN_WIDTH,
    OVERVIEW_COLUMN_MAX_WIDTH,
    "left",
  );
  const { height: panelHeight, onPointerDown: onPanelResizeStart } = useResizableHeight(
    PANEL_DEFAULT_HEIGHT,
    PANEL_MIN_HEIGHT,
    PANEL_MAX_HEIGHT,
    "bottom",
  );
  const { layout } = useWorkbenchLayout();
  useWorkbenchShortcuts();
  const zoom = useZoom();
  const { tabs, activeId } = useTabs();
  const activeKind = tabs.find((tab) => tab.id === activeId)?.kind ?? "new";
  const restoring = useRestoreLastRepository();
  useTrackRepositoryOpened();

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <TabBar />
      <Profiler id="Header" onRender={onRender}>
        <Header />
      </Profiler>
      {activeKind === "settings" ? (
        <main className="flex-1 min-w-0 min-h-0" style={{ zoom: `${zoom.zoom}%` }}>
          <SettingsView />
        </main>
      ) : activeKind === "new" ? (
        // The launcher spans all three columns. Blank while startup decides
        // whether to reopen the last repository, so it doesn't flash.
        <main className="flex-1 min-w-0 min-h-0" style={{ zoom: `${zoom.zoom}%` }}>
          {!restoring && <LauncherView />}
        </main>
      ) : (
        <main className="flex-1 flex flex-col min-w-0 min-h-0" style={{ zoom: `${zoom.zoom}%` }}>
          <div className="flex-1 flex min-w-0 min-h-0">
            {layout.primarySidebar && (
              <>
                <div className="flex-none h-full" style={{ width: overviewWidth }}>
                  <Profiler id="RepositoryOverviewColumn" onRender={onRender}>
                    <RepositoryOverviewColumn />
                  </Profiler>
                </div>
                <ColumnResizeHandle onPointerDown={onOverviewResizeStart} />
              </>
            )}
            <div className="flex-1 min-w-0 h-full">
              {mainView === "graph" ? (
                <Profiler id="GraphColumn" onRender={onRender}>
                  <GraphColumn />
                </Profiler>
              ) : (
                <Profiler id="CommitsColumn" onRender={onRender}>
                  <CommitsColumn />
                </Profiler>
              )}
            </div>
            {layout.secondarySidebar && (
              <>
                <ColumnResizeHandle onPointerDown={onPointerDown} />
                <div className="flex-none h-full overflow-hidden" style={{ width: changesWidth }}>
                  <Profiler id="ChangesColumn" onRender={onRender}>
                    <ChangesColumn />
                  </Profiler>
                </div>
              </>
            )}
          </div>
          {layout.panel && (
            <>
              <PanelResizeHandle onPointerDown={onPanelResizeStart} />
              <div className="flex-none min-h-0" style={{ height: panelHeight }}>
                <Profiler id="CommitPanel" onRender={onRender}>
                  <CommitPanel />
                </Profiler>
              </div>
            </>
          )}
        </main>
      )}
      <Footer zoom={zoom} />
    </div>
  );
}
