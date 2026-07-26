import { useState } from "react";

import { useCommitGraph } from "@/features/commit-graph";
import { DEFAULT_GRAVITY_STRENGTH } from "@/lib/graph/useForceSimulation";
import { GraphDateRangeBar } from "./graph/GraphDateRangeBar";
import { GraphForcePanel } from "./graph/GraphForcePanel";
import { ForceGraph } from "./graph/ForceGraph";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

export function GraphColumn() {
  const [startDate, setStartDate] = useState<Date | undefined>(() => daysAgo(30));
  const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());
  const [gravityStrength, setGravityStrength] = useState(DEFAULT_GRAVITY_STRENGTH);

  const { data, loading, error } = useCommitGraph(startDate, endDate);

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      <GraphDateRangeBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <GraphForcePanel gravityStrength={gravityStrength} onGravityStrengthChange={setGravityStrength} />
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
      <ForceGraph
        nodes={data?.nodes ?? []}
        edges={data?.edges ?? []}
        loading={loading}
        gravityStrength={gravityStrength}
      />
    </div>
  );
}
