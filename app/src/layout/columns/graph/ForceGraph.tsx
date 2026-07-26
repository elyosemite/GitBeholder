import { useMemo } from "react";

import { useElementSize } from "@/lib/hooks/useElementSize";
import { useForceSimulation } from "@/lib/graph/useForceSimulation";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";

export function ForceGraph({
  nodes,
  edges,
  loading,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  loading: boolean;
}) {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const positioned = useForceSimulation(nodes, edges, width, height);

  const byId = useMemo(() => new Map(positioned.map((node) => [node.id, node])), [positioned]);

  return (
    <div ref={ref} className="relative min-h-0 flex-1 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-caption text-ink-faint">
          Loading…
        </div>
      )}
      {!loading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-caption text-ink-faint">
          No commits in this date range.
        </div>
      )}
      {width > 0 && height > 0 && (
        <svg width={width} height={height} className="block">
          <g>
            {edges.map((edge, index) => {
              const source = byId.get(edge.source);
              const target = byId.get(edge.target);
              if (!source || source.x === undefined || source.y === undefined) return null;
              if (!target || target.x === undefined || target.y === undefined) return null;

              return (
                <line
                  key={index}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className="stroke-line-subtle"
                  strokeWidth={1}
                />
              );
            })}
          </g>
          <g>
            {positioned.map((node) =>
              node.x === undefined || node.y === undefined ? null : (
                <circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  className={node.kind === "file" ? "fill-accent" : "fill-ink-faint"}
                >
                  <title>{node.label}</title>
                </circle>
              ),
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
