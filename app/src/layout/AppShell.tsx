import { Header } from "./header/Header";
import { RepositoryOverviewColumn } from "./columns/RepositoryOverviewColumn";
import { CommitsColumn } from "./columns/CommitsColumn";
import { DiffColumn } from "./columns/DiffColumn";
import { ChangesColumn } from "./columns/ChangesColumn";
import { useSession } from "@/features/session";
import { useResizableWidth } from "@/lib/hooks/useResizableWidth";

const CHANGES_COLUMN_DEFAULT_WIDTH = 288; // matches the previous fixed w-72
const CHANGES_COLUMN_MAX_WIDTH = 480;

export function AppShell() {
  const { diffFile } = useSession();
  const { width: changesWidth, onPointerDown } = useResizableWidth(
    CHANGES_COLUMN_DEFAULT_WIDTH,
    0,
    CHANGES_COLUMN_MAX_WIDTH,
  );

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <Header />
      <main className="flex-1 flex min-w-0 min-h-0">
        <div className="w-72 flex-none h-full">
          <RepositoryOverviewColumn />
        </div>
        <div className="flex-1 min-w-0 h-full">
          {diffFile !== null ? <DiffColumn /> : <CommitsColumn />}
        </div>
        <div
          onPointerDown={onPointerDown}
          role="separator"
          aria-orientation="vertical"
          title="Arraste para redimensionar"
          className="w-1 flex-none h-full cursor-col-resize bg-line-subtle hover:bg-accent active:bg-accent"
        />
        <div className="flex-none h-full overflow-hidden" style={{ width: changesWidth }}>
          <ChangesColumn />
        </div>
      </main>
    </div>
  );
}
