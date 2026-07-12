import { Header } from "./header/Header";
import { RepositoryOverviewColumn } from "./columns/RepositoryOverviewColumn";
import { CommitsColumn } from "./columns/CommitsColumn";
import { DiffColumn } from "./columns/DiffColumn";
import { ChangesColumn } from "./columns/ChangesColumn";
import { useSession } from "@/features/session";

export function AppShell() {
  const { diffFile } = useSession();

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
        <div className="w-72 flex-none h-full">
          <ChangesColumn />
        </div>
      </main>
    </div>
  );
}
