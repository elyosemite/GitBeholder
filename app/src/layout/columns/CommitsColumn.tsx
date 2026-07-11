import { useRef, useState } from "react";
import { Check, GitBranch, Monitor, Tag } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommits, type Commit, type CommitRef } from "@/features/commits";
import { PlatformIcon } from "@/components/icons/brand-icons";

// Graph keeps a fixed width: dragging either of its edges shifts the whole
// zone by resizing the ref zone, so both handles share the same state.
const GRAPH_WIDTH = 56;
const MIN_REF_WIDTH = 40; // just enough for an icon-only badge
const MAX_REF_WIDTH = 320;
// below this, the badge drops one trailing icon (local wins over platform)
const COMPACT_REF_WIDTH = 120;
const ROW_PADDING_X = 12;
const TIME_ZONE_WIDTH = "w-32";

const AUTHOR_COLORS: Record<string, string> = {
  yurimelo: "bg-sky-500/20 text-sky-400",
  "ana.dev": "bg-violet-500/20 text-violet-400",
  "camila.reis": "bg-emerald-500/20 text-emerald-400",
  "pedro.lima": "bg-amber-500/20 text-amber-400",
  "rafael.souza": "bg-rose-500/20 text-rose-400",
  dependabot: "bg-slate-500/20 text-slate-400",
};

function authorInitials(author: string) {
  return author.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}

// At the minimum zone width the badge collapses into a square with a single
// centered icon: tag > local > platform > current > generic branch.
function IconOnlyBadge({ commitRef }: { commitRef: CommitRef }) {
  let icon;
  if (commitRef.type === "tag") {
    icon = <Tag aria-hidden="true" size={11} className="text-amber-400" />;
  } else if (commitRef.local) {
    icon = <Monitor aria-hidden="true" size={11} className="text-ink-secondary" />;
  } else if (commitRef.platform) {
    icon = <PlatformIcon platform={commitRef.platform} className="text-ink-secondary" />;
  } else if (commitRef.current) {
    icon = <Check aria-hidden="true" size={11} className="text-success" />;
  } else {
    icon = <GitBranch aria-hidden="true" size={11} className="text-ink-secondary" />;
  }

  return (
    <div
      className="flex size-5 flex-none items-center justify-center border border-line-default bg-surface"
      title={commitRef.name}
    >
      {icon}
    </div>
  );
}

// The four-part ref badge: [check if HEAD] [name — always] [monitor if local] [platform icon].
// When the ref zone is narrow only one of the two trailing icons fits: local wins.
function RefBadge({ commitRef, compact }: { commitRef: CommitRef; compact: boolean }) {
  const showLocal = commitRef.local;
  const showPlatform = commitRef.platform && (!compact || !commitRef.local);

  return (
    <div className="flex h-5 min-w-0 items-center gap-1 border border-line-default bg-surface px-1.5">
      {commitRef.type === "tag" && (
        <Tag aria-hidden="true" size={10} className="flex-none text-amber-400" />
      )}
      {commitRef.current && (
        <Check aria-label="branch atual" size={11} className="flex-none text-success" />
      )}
      <span className="truncate text-meta text-ink-secondary" title={commitRef.name}>
        {commitRef.name}
      </span>
      {showLocal && (
        <Monitor aria-label="branch local" size={11} className="flex-none text-ink-secondary" />
      )}
      {showPlatform && (
        <PlatformIcon platform={commitRef.platform!} className="flex-none text-ink-secondary" />
      )}
    </div>
  );
}

function CommitRow({
  commit,
  first,
  last,
  refWidth,
}: {
  commit: Commit;
  first: boolean;
  last: boolean;
  refWidth: number;
}) {
  const hasRefs = commit.refs.length > 0;
  const railPosition = first ? "top-1/2 bottom-0" : last ? "top-0 bottom-1/2" : "inset-y-0";

  return (
    <div className="flex h-8 items-center border-b border-line-subtle px-row-x hover:bg-overlay-hover">
      <div className="flex min-w-0 flex-none items-center" style={{ width: refWidth }}>
        {hasRefs && (
          <>
            {refWidth <= MIN_REF_WIDTH ? (
              <IconOnlyBadge commitRef={commit.refs[0]} />
            ) : (
              <RefBadge commitRef={commit.refs[0]} compact={refWidth < COMPACT_REF_WIDTH} />
            )}
            {/* connector from the badge to the avatar in the graph column */}
            <div className="h-px min-w-2 flex-1 bg-line-default" />
          </>
        )}
      </div>

      <div
        className="relative flex h-full flex-none items-center justify-center"
        style={{ width: GRAPH_WIDTH }}
      >
        <div className={"absolute left-1/2 w-0.5 -translate-x-1/2 bg-accent/60 " + railPosition} />
        {hasRefs && <div className="absolute top-1/2 right-1/2 left-0 h-px bg-line-default" />}
        <Avatar size="xs" className="z-10 ring-1 ring-primary" title={commit.author}>
          <AvatarImage src="/avatar.png" alt={commit.author} />
          <AvatarFallback
            className={"text-micro font-semibold " + (AUTHOR_COLORS[commit.author] ?? "")}
          >
            {authorInitials(commit.author)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div
        className="flex min-w-0 flex-1 items-baseline gap-icon px-row-x"
        title={commit.description ? `${commit.message}\n\n${commit.description}` : commit.message}
      >
        <span className="flex-none text-row text-ink">{commit.message}</span>
        {commit.description && (
          <span className="min-w-0 flex-1 truncate text-row text-ink-faint">{commit.description}</span>
        )}
      </div>

      <div className={TIME_ZONE_WIDTH + " flex-none text-right font-mono text-meta text-ink-faint"}>
        {commit.timestamp}
      </div>
    </div>
  );
}

function ResizeHandle({ left, onDrag }: { left: number; onDrag: (dx: number) => void }) {
  const lastX = useRef(0);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="absolute inset-y-0 z-20 w-1.5 -translate-x-1/2 cursor-col-resize transition-colors hover:bg-accent/40 active:bg-accent/60"
      style={{ left }}
      onPointerDown={(event) => {
        lastX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        onDrag(event.clientX - lastX.current);
        lastX.current = event.clientX;
      }}
    />
  );
}

export function CommitsColumn() {
  const [refWidth, setRefWidth] = useState(208);
  const { data: commits } = useCommits();
  const rows = commits ?? [];

  function resizeRefZone(dx: number) {
    setRefWidth((width) => Math.min(MAX_REF_WIDTH, Math.max(MIN_REF_WIDTH, width + dx)));
  }

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      {/* <ColumnHeader title="Commits" /> */}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex flex-none items-center border-b border-line-subtle bg-panel px-row-x py-1 text-meta font-bold uppercase tracking-[0.08em] text-ink-faint">
          <div className="flex-none truncate" style={{ width: refWidth }}>
            Branch / Tag
          </div>
          <div className="flex-none text-center" style={{ width: GRAPH_WIDTH }}>
            Graph
          </div>
          <div className="flex-1 px-row-x">Commit</div>
          <div className={TIME_ZONE_WIDTH + " flex-none text-right"}>Timestamp</div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {rows.map((commit, index) => (
            <CommitRow
              key={commit.hash}
              commit={commit}
              first={index === 0}
              last={index === rows.length - 1}
              refWidth={refWidth}
            />
          ))}
        </div>

        {/* both handles resize the ref zone, so the graph column keeps its width */}
        <ResizeHandle left={ROW_PADDING_X + refWidth} onDrag={resizeRefZone} />
        <ResizeHandle left={ROW_PADDING_X + refWidth + GRAPH_WIDTH} onDrag={resizeRefZone} />
      </div>
    </div>
  );
}
