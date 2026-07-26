import { useMemo, useState } from "react";

import { useElementSize } from "@/lib/hooks/useElementSize";
import { useForceSimulation, type SimNode } from "@/lib/graph/useForceSimulation";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";

function NodeTooltip({ node }: { node: SimNode }) {
  if (node.x === undefined || node.y === undefined) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-md border border-line-subtle bg-popover px-2 py-1.5 text-caption text-popover-foreground shadow-md"
      style={{ left: node.x + node.radius + 8, top: node.y - 8 }}
    >
      {node.data.type === "commit" ? (
        <>
          <span className="font-mono font-medium text-ink">{node.data.hash.slice(0, 7)}</span>
          <span className="text-ink-faint">{node.data.author}</span>
          <span className="text-ink-faint">{node.data.timestamp}</span>
        </>
      ) : (
        <span className="font-medium text-ink">{node.data.name}</span>
      )}
    </div>
  );
}

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
  const { positioned, drag } = useForceSimulation(nodes, edges, width, height);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const byId = useMemo(() => new Map(positioned.map((node) => [node.id, node])), [positioned]);
  const hoveredNode = hoveredId ? byId.get(hoveredId) : undefined;

  function toLocalPoint(event: React.PointerEvent) {
    const bounds = ref.current?.getBoundingClientRect();
    return {
      x: event.clientX - (bounds?.left ?? 0),
      y: event.clientY - (bounds?.top ?? 0),
    };
  }

  function handlePointerDown(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(node.id);
    drag.onDragStart(node.id);
  }

  function handlePointerMove(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    if (draggingId !== node.id) return;
    const { x, y } = toLocalPoint(event);
    drag.onDrag(node.id, x, y);
  }

  function handlePointerUp(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingId(null);
    drag.onDragEnd(node.id);
  }

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
                  style={{ cursor: draggingId === node.id ? "grabbing" : "grab", touchAction: "none" }}
                  onPointerDown={(event) => handlePointerDown(node, event)}
                  onPointerMove={(event) => handlePointerMove(node, event)}
                  onPointerUp={(event) => handlePointerUp(node, event)}
                  onPointerCancel={(event) => handlePointerUp(node, event)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              ),
            )}
          </g>
        </svg>
      )}
      {hoveredNode && <NodeTooltip node={hoveredNode} />}
    </div>
  );
}
