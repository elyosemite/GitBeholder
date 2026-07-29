import { useState } from "react";

import { useCommitGraph } from "@/features/commit-graph";
import { daysAgo } from "@/lib/daysAgo";
import { CommitActivityBar } from "./graph/CommitActivityBar";
import { GraphDateRangeBar } from "./graph/GraphDateRangeBar";
import { ForceGraph } from "./graph/ForceGraph";

export function GraphColumn() {
  const [startDate, setStartDate] = useState<Date | undefined>(() => daysAgo(30));
  const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());

  const { data, loading, error } = useCommitGraph(startDate, endDate);

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      <CommitActivityBar startDate={startDate} endDate={endDate} />
      <GraphDateRangeBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      {error && (
        <div className="border-b border-line-subtle px-panel-x py-2 text-caption text-danger">
          {error}
        </div>
      )}
      {data?.truncated && (
        <div className="border-b border-line-subtle px-panel-x py-2 text-caption text-ink-faint">
          Showing a partial view — this range has more commits than fit here. Narrow the dates
          to see everything.
        </div>
      )}
      <ForceGraph nodes={data?.nodes ?? []} edges={data?.edges ?? []} loading={loading} />
    </div>
  );
}
