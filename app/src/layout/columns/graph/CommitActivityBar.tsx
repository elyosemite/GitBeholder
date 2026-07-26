import { useMemo, useState } from "react";

import { useCommitActivity, type CommitActivityDay } from "@/features/commit-activity";
import { useStashes } from "@/features/stashes";
import { useResizableHeight } from "@/lib/hooks/useResizableHeight";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 150;
const DEFAULT_HEIGHT = 80;

// Same token palette CommitsColumn uses for author avatars, hashed by
// name instead of a fixed lookup - branch names are unbounded, unlike
// that hardcoded author list.
const BRANCH_COLOR_PALETTE = [
  "bg-sky-500/20 text-sky-400",
  "bg-violet-500/20 text-violet-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-slate-500/20 text-slate-400",
];

function branchColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return BRANCH_COLOR_PALETTE[Math.abs(hash) % BRANCH_COLOR_PALETTE.length];
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function emptyDay(date: string): CommitActivityDay {
  return { date, commit_count: 0, file_count: 0, lines_changed: 0, authors: [], branches: [] };
}

// Fills gaps so the timeline reads continuously — a day with zero
// commits is still a bar (a very short one), not a missing one.
function fillRange(buckets: CommitActivityDay[], startDate: Date, endDate: Date): CommitActivityDay[] {
  const byDate = new Map(buckets.map((day) => [day.date, day]));
  const days: CommitActivityDay[] = [];

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = toDateKey(cursor);
    days.push(byDate.get(key) ?? emptyDay(key));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CommitActivityBar({
  startDate,
  endDate,
}: {
  startDate: Date | undefined;
  endDate: Date | undefined;
}) {
  const { height, onPointerDown } = useResizableHeight(DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT);
  const { data } = useCommitActivity(startDate, endDate);
  const { data: stashes } = useStashes();
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const days = useMemo(
    () => (startDate && endDate ? fillRange(data?.buckets ?? [], startDate, endDate) : []),
    [data, startDate, endDate],
  );

  const maxCount = days.reduce((max, day) => Math.max(max, day.commit_count), 1);
  const hoveredDay = days.find((day) => day.date === hoveredDate);

  return (
    <div className="relative flex-none border-b border-line-subtle" style={{ height }}>
      <div className="flex h-full items-stretch gap-px overflow-x-auto px-panel-x py-2">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex h-full w-[6px] flex-none items-end"
            onMouseEnter={() => setHoveredDate(day.date)}
            onMouseLeave={() => setHoveredDate((current) => (current === day.date ? null : current))}
          >
            <div
              className="w-full border-none bg-accent/60 hover:bg-accent"
              style={{
                height: `${Math.max((day.commit_count / maxCount) * 100, day.commit_count > 0 ? 4 : 1)}%`,
              }}
            />
          </div>
        ))}
      </div>

      {hoveredDay && (
        <div className="pointer-events-none absolute left-2 top-full z-10 mt-1 flex max-w-md flex-col gap-1 rounded-md border border-line-subtle bg-popover px-2 py-1.5 text-caption text-popover-foreground shadow-md">
          <div className="whitespace-nowrap">
            {formatDate(hoveredDay.date)} ({formatRelativeTime(new Date(hoveredDay.date))}) ·{" "}
            {hoveredDay.commit_count} commits · {hoveredDay.file_count} files ·{" "}
            {hoveredDay.lines_changed} lines · {hoveredDay.authors.join(", ") || "—"}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {hoveredDay.branches.map((branch) => (
              <span
                key={branch}
                className={`rounded px-1.5 py-0.5 text-micro font-medium ${branchColor(branch)}`}
              >
                {branch}
              </span>
            ))}
            <span className="text-ink-faint">{stashes?.length ?? 0} stashes</span>
          </div>
        </div>
      )}

      <div
        onPointerDown={onPointerDown}
        role="separator"
        aria-orientation="horizontal"
        title="Drag to resize"
        className="absolute inset-x-0 bottom-0 h-1 cursor-row-resize hover:bg-accent active:bg-accent"
      />
    </div>
  );
}
