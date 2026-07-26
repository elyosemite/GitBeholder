import { useEffect, useMemo, useRef, useState } from "react";

import { useElementSize } from "@/lib/hooks/useElementSize";
import { useForceSimulation, type SimNode } from "@/lib/graph/useForceSimulation";
import { usePanZoom, type Point, type Transform } from "@/lib/graph/usePanZoom";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";

const ZOOM_SENSITIVITY = 0.002;

/**
 * Converts a client (viewport) point into the root `<svg>`'s own
 * coordinate space via its screen CTM. This is what makes drag/pan/zoom
 * math correct regardless of the app-wide CSS `zoom` control (Footer) —
 * `getBoundingClientRect()`-based math doesn't reliably cancel that out,
 * `getScreenCTM()` does because it reflects the actual rendered
 * transform chain.
 */
function toSvgPoint(svg: SVGSVGElement, event: { clientX: number; clientY: number }): Point {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
  return { x: point.x, y: point.y };
}

function toScreen(point: Point, transform: Transform): Point {
  return { x: point.x * transform.k + transform.x, y: point.y * transform.k + transform.y };
}

function NodeTooltip({ node, transform }: { node: SimNode; transform: Transform }) {
  if (node.x === undefined || node.y === undefined) return null;
  const screen = toScreen({ x: node.x, y: node.y }, transform);

  return (
    <div
      className="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-md border border-line-subtle bg-popover px-2 py-1.5 text-caption text-popover-foreground shadow-md"
      style={{ left: screen.x + node.radius * transform.k + 8, top: screen.y - 8 }}
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
  const svgRef = useRef<SVGSVGElement>(null);
  const { positioned, drag } = useForceSimulation(nodes, edges, width, height);
  const { transform, panBy, zoomAt, toWorld } = usePanZoom();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPointRef = useRef<Point | null>(null);

  const byId = useMemo(() => new Map(positioned.map((node) => [node.id, node])), [positioned]);
  const hoveredNode = hoveredId ? byId.get(hoveredId) : undefined;

  // Wheel needs a native (non-passive) listener to reliably preventDefault —
  // React's synthetic onWheel is passive by default. Plain scroll pans
  // (2-finger trackpad swipe / mouse wheel), ctrl/cmd+scroll zooms —
  // same split as Figma/Miro/Google Maps.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (!svg) return;
      const point = toSvgPoint(svg, event);

      if (event.ctrlKey || event.metaKey) {
        zoomAt(point, Math.exp(-event.deltaY * ZOOM_SENSITIVITY));
      } else {
        panBy(-event.deltaX, -event.deltaY);
      }
    }

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [zoomAt, panBy, width, height]);

  function handleNodePointerDown(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(node.id);
    drag.onDragStart(node.id);
  }

  function handleNodePointerMove(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    const svg = svgRef.current;
    if (!svg || draggingId !== node.id) return;
    const world = toWorld(toSvgPoint(svg, event));
    drag.onDrag(node.id, world.x, world.y);
  }

  function handleNodePointerUp(node: SimNode, event: React.PointerEvent<SVGCircleElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingId(null);
    drag.onDragEnd(node.id);
  }

  function handleBackgroundPointerDown(event: React.PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    lastPanPointRef.current = toSvgPoint(svg, event);
  }

  function handleBackgroundPointerMove(event: React.PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg || !lastPanPointRef.current) return;
    const point = toSvgPoint(svg, event);
    panBy(point.x - lastPanPointRef.current.x, point.y - lastPanPointRef.current.y);
    lastPanPointRef.current = point;
  }

  function handleBackgroundPointerUp(event: React.PointerEvent<SVGRectElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsPanning(false);
    lastPanPointRef.current = null;
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
        <svg ref={svgRef} width={width} height={height} className="block">
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
            onPointerDown={handleBackgroundPointerDown}
            onPointerMove={handleBackgroundPointerMove}
            onPointerUp={handleBackgroundPointerUp}
            onPointerCancel={handleBackgroundPointerUp}
          />
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
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
                    strokeWidth={1 / transform.k}
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
                    onPointerDown={(event) => handleNodePointerDown(node, event)}
                    onPointerMove={(event) => handleNodePointerMove(node, event)}
                    onPointerUp={(event) => handleNodePointerUp(node, event)}
                    onPointerCancel={(event) => handleNodePointerUp(node, event)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                ),
              )}
            </g>
          </g>
        </svg>
      )}
      {hoveredNode && <NodeTooltip node={hoveredNode} transform={transform} />}
    </div>
  );
}
