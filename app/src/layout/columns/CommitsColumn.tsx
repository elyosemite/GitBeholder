import { memo, useRef, useState } from "react";
import { Check, GitBranch, Monitor, Tag } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommits, type Commit, type CommitRef } from "@/features/commits";
import { useSessionActions, useSessionValue } from "@/features/session";
import { PlatformIcon } from "@/components/icons/brand-icons";
import { daysAgo } from "@/lib/daysAgo";
import { useElementSize } from "@/lib/hooks/useElementSize";
import { pxToken } from "@/lib/designTokens";
import { authorColor, authorInitials } from "@/lib/authorColor";
import { CommitActivityBar } from "./graph/CommitActivityBar";

// Graph keeps a fixed width: dragging either of its edges shifts the whole
// zone by resizing the ref zone, so both handles share the same state.
const GRAPH_WIDTH = 56;
const MIN_REF_WIDTH = 40; // just enough for an icon-only badge
const MAX_REF_WIDTH = 320;
// below this, the badge drops one trailing icon (local wins over platform)
const COMPACT_REF_WIDTH = 120;
const TIME_ZONE_WIDTH = "w-32";
// Only the rows in view (plus OVERSCAN_ROWS on each side) are rendered —
// mounting all 200 at once was a 260 ms render. Row geometry comes from the
// design tokens (--spacing-row, --spacing-row-gap), read in the component.
const OVERSCAN_ROWS = 10;

// At the minimum zone width the badge collapses into a square with a single
// centered icon: tag > local > platform > current > generic branch.
function IconOnlyBadge({ commitRef }: { commitRef: CommitRef }) {
  let icon;
  if (commitRef.type === "tag") {
    icon = <Tag aria-hidden="true" className="size-icon-xs text-tag" />;
  } else if (commitRef.local) {
    icon = <Monitor aria-hidden="true" className="size-icon-xs text-ink-secondary" />;
  } else if (commitRef.platform) {
    icon = <PlatformIcon platform={commitRef.platform} className="text-ink-secondary" />;
  } else if (commitRef.current) {
    icon = <Check aria-hidden="true" className="size-icon-xs text-success" />;
  } else {
    icon = <GitBranch aria-hidden="true" className="size-icon-xs text-ink-secondary" />;
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
        <Tag aria-hidden="true" className="size-icon-xs flex-none text-tag" />
      )}
      {commitRef.current && (
        <Check aria-label="current branch" className="size-icon-xs flex-none text-success" />
      )}
      <span className="truncate text-meta text-ink-secondary" title={commitRef.name}>
        {commitRef.name}
      </span>
      {showLocal && (
        <Monitor aria-label="local branch" className="size-icon-xs flex-none text-ink-secondary" />
      )}
      {showPlatform && (
        <PlatformIcon platform={commitRef.platform!} className="flex-none text-ink-secondary" />
      )}
    </div>
  );
}

const CommitRow = memo(function CommitRow({
  commit,
  index,
  first,
  last,
  refWidth,
  isSelected,
  animate,
  onSelect,
}: {
  commit: Commit;
  index: number;
  first: boolean;
  last: boolean;
  refWidth: number;
  isSelected: boolean;
  animate: boolean;
  onSelect: (hash: string) => void;
}) {
  const hasRefs = commit.refs.length > 0;
  // Bleeds half of --spacing-row-gap (4px) into the space between rows on
  // either side, so
  // consecutive rows' rails meet in the middle of the gap instead of
  // stopping dead at the row's own edge.
  const railPosition = first
    ? "top-1/2 -bottom-0.5"
    : last
      ? "-top-0.5 bottom-1/2"
      : "-top-0.5 -bottom-0.5";
  // Stagger the entrance so the log reads top-to-bottom instead of
  // popping in all at once; caps out so a long list doesn't feel sluggish.
  // Decided once at mount: rows mounted by scrolling don't fade in.
  const [animateEntrance] = useState(animate);
  const delay = Math.min(index, 8) * 40;

  return (
    <button
      type="button"
      onClick={() => onSelect(commit.hash)}
      style={
        animateEntrance ? { animationDelay: `${delay}ms`, animationFillMode: "backwards" } : undefined
      }
      className={
        "flex h-row w-full items-center px-row-x text-left text-row " +
        (animateEntrance ? "animate-in fade-in-0 slide-in-from-top-1 " : "") +
        (isSelected ? "bg-accent-soft" : "hover:bg-overlay-hover")
      }
    >
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
        <div className={"absolute left-1/2 w-0.5 -translate-x-1/2 bg-accent " + railPosition} />
        {hasRefs && <div className="absolute top-1/2 right-1/2 left-0 h-px bg-line-default" />}
        <Avatar size="sm" className="z-10 border-2 border-accent" title={commit.author}>
          <AvatarImage src="/avatar.png" alt={commit.author} />
          <AvatarFallback
            className={"text-micro font-semibold " + authorColor(commit.author)}
          >
            {authorInitials(commit.author)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div
        className="flex min-w-0 flex-1 items-baseline gap-icon px-row-x"
        title={commit.description ? `${commit.message}\n\n${commit.description}` : commit.message}
      >
        <span className="min-w-0 flex-3 truncate text-row text-ink">{commit.message}</span>
        {commit.description && (
          <span className="min-w-0 flex-2 truncate text-row text-ink-faint">{commit.description}</span>
        )}
      </div>

      <div className={TIME_ZONE_WIDTH + " flex-none text-right font-mono text-meta text-ink-faint"}>
        {commit.timestamp}
      </div>
    </button>
  );
});

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
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit);
  const { selectCommit } = useSessionActions();
  const rows = commits ?? [];
  const [activityStartDate] = useState(() => daysAgo(30));
  const [activityEndDate] = useState(() => new Date());
  const { ref: listRef, height: listHeight } = useElementSize<HTMLDivElement>();
  // The first row in view, not the raw scrollTop: React state only changes
  // when a row boundary is crossed, not on every scroll event.
  const [topRow, setTopRow] = useState(0);
  // Entrance animation plays for rows mounted by a (re)load, not by scrolling.
  // Reset in render (not an effect) so rows of a fresh load animate in the
  // very render that mounts them.
  const hasScrolledRef = useRef(false);
  const lastCommitsRef = useRef(commits);
  if (lastCommitsRef.current !== commits) {
    lastCommitsRef.current = commits;
    hasScrolledRef.current = false;
  }

  const rowHeight = pxToken("--spacing-row");
  const rowGap = pxToken("--spacing-row-gap");
  const rowPitch = rowHeight + rowGap;
  const rowPaddingX = pxToken("--spacing-row-x");

  const firstVisible = Math.max(0, topRow - OVERSCAN_ROWS);
  const lastVisible = Math.min(
    rows.length,
    topRow + Math.ceil(listHeight / rowPitch) + 1 + OVERSCAN_ROWS,
  );

  function resizeRefZone(dx: number) {
    setRefWidth((width) => Math.min(MAX_REF_WIDTH, Math.max(MIN_REF_WIDTH, width + dx)));
  }

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      {/* <ColumnHeader title="Commits" /> */}
      <CommitActivityBar startDate={activityStartDate} endDate={activityEndDate} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex flex-none items-center border-b border-line-subtle bg-panel px-row-x py-1 text-meta font-bold uppercase tracking-caps text-ink-faint">
          <div className="flex-none truncate" style={{ width: refWidth }}>
            Branch / Tag
          </div>
          <div className="flex-none text-center" style={{ width: GRAPH_WIDTH }}>
            Graph
          </div>
          <div className="flex-1 px-row-x">Commit</div>
          <div className={TIME_ZONE_WIDTH + " flex-none text-right"}>Timestamp</div>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto"
          onScroll={(event) => {
            hasScrolledRef.current = true;
            setTopRow(Math.floor(event.currentTarget.scrollTop / rowPitch));
          }}
        >
          <div
            className="relative"
            style={{ height: Math.max(0, rows.length * rowPitch - rowGap) }}
          >
            {rows.slice(firstVisible, lastVisible).map((commit, offset) => {
              const index = firstVisible + offset;
              return (
                <div
                  key={commit.hash}
                  className="absolute inset-x-0"
                  style={{ top: index * rowPitch }}
                >
                  <CommitRow
                    commit={commit}
                    index={index}
                    first={index === 0}
                    last={index === rows.length - 1}
                    refWidth={refWidth}
                    isSelected={inspectedCommit === commit.hash}
                    animate={!hasScrolledRef.current}
                    onSelect={selectCommit}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* both handles resize the ref zone, so the graph column keeps its width */}
        <ResizeHandle left={rowPaddingX + refWidth} onDrag={resizeRefZone} />
        <ResizeHandle left={rowPaddingX + refWidth + GRAPH_WIDTH} onDrag={resizeRefZone} />
      </div>
    </div>
  );
}
