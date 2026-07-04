import { useState } from "react";
import { Header } from "./components/Header";
import { WorkspaceList } from "./components/WorkspaceList";
import { RepositoryList } from "./components/RepositoryList";
import { CommitLog } from "./components/CommitLog";
import type { Repository, Workspace } from "./api/types";
import "./App.css";

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);

  function selectWorkspace(next: Workspace) {
    setWorkspace(next);
    setRepository(null);
  }

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <Header workspaceName={workspace?.name} repositoryName={repository?.name} />
      <div className="flex-1 flex min-h-0">
        <aside className="w-60 flex-none bg-panel border-r border-line-subtle overflow-y-auto py-3 px-2">
          <WorkspaceList selectedId={workspace?.id ?? null} onSelect={selectWorkspace} />
          <RepositoryList
            workspaceId={workspace?.id ?? null}
            selectedId={repository?.id ?? null}
            onSelect={setRepository}
          />
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto">
          <CommitLog
            workspaceId={workspace?.id ?? null}
            repositoryId={repository?.id ?? null}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
