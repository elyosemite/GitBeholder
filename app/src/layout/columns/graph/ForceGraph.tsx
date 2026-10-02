import { memo, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

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

function tooltipPosition(node: SimNode, transform: Transform): Point | null {
  if (node.x === undefined || node.y === undefined) return null;
  const screen = toScreen({ x: node.x, y: node.y }, transform);
  return { x: screen.x + node.radius * transform.k + 8, y: screen.y - 8 };
}

function NodeTooltip({
  node,
  transform,
  ref,
}: {
  node: SimNode;
  transform: Transform;
  ref: React.Ref<HTMLDivElement>;
}) {
  const position = tooltipPosition(node, transform);
  if (!position) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-md border border-line-subtle bg-popover px-2 py-1.5 text-caption text-popover-foreground shadow-md"
      style={{ left: position.x, top: position.y }}
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

function nodeIdOf(target: EventTarget): string | undefined {
  return target instanceof SVGElement ? target.dataset.nodeId : undefined;
}

interface NodeHandlers {
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
  onPointerMove: (event: React.PointerEvent<SVGGElement>) => void;
  onPointerUp: (event: React.PointerEvent<SVGGElement>) => void;
  onPointerOver: (event: React.PointerEvent<SVGGElement>) => void;
  onPointerOut: (event: React.PointerEvent<SVGGElement>) => void;
}

// Edges and nodes are memoized layers: hover, pan/zoom and drag change
// ForceGraph's state but none of these props, so the thousands of
// <line>/<circle> elements of a large graph only re-render when the
// layout itself changes. Positions move via moveToTick, not React.
const EdgeLayer = memo(function EdgeLayer({
  edges,
  byId,
  lineRefs,
}: {
  edges: GraphEdge[];
  byId: Map<string, SimNode>;
  lineRefs: RefObject<(SVGLineElement | null)[]>;
}) {
  return (
    <g>
      {edges.map((edge, index) => {
        const source = byId.get(edge.source);
        const target = byId.get(edge.target);
        if (!source || source.x === undefined || source.y === undefined) return null;
        if (!target || target.x === undefined || target.y === undefined) return null;

        return (
          <line
            key={index}
            ref={(line) => {
              lineRefs.current[index] = line;
            }}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            className="stroke-line-subtle"
            // 1 screen pixel at any zoom, without depending on transform.k.
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
});

// Pointer handlers sit on the <g> (event delegation) and find the node
// through data-node-id, so no per-circle closures change between renders.
const NodeLayer = memo(function NodeLayer({
  positioned,
  circleRefs,
  handlers,
}: {
  positioned: SimNode[];
  circleRefs: RefObject<Map<string, SVGCircleElement>>;
  handlers: NodeHandlers;
}) {
  return (
    <g
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerUp}
      onPointerOver={handlers.onPointerOver}
      onPointerOut={handlers.onPointerOut}
    >
      {positioned.map((node) =>
        node.x === undefined || node.y === undefined ? null : (
          <circle
            key={node.id}
            ref={(circle) => {
              if (circle) circleRefs.current.set(node.id, circle);
              else circleRefs.current.delete(node.id);
            }}
            data-node-id={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            className={node.kind === "file" ? "fill-accent" : "fill-ink-faint"}
            style={{ cursor: "grab", touchAction: "none" }}
          />
        ),
      )}
    </g>
  );
});

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
  const circleRefs = useRef(new Map<string, SVGCircleElement>());
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Read by moveToTick, which runs outside React renders.
  const byIdRef = useRef(new Map<string, SimNode>());
  const edgesRef = useRef(edges);
  const transformRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
  const hoveredIdRef = useRef<string | null>(null);

  // Per simulation tick: move the already-rendered circles, lines and
  // tooltip to the nodes' new x/y without a React render.
  const moveToTick = useCallback(() => {
    const byId = byIdRef.current;

    for (const [id, circle] of circleRefs.current) {
      const node = byId.get(id);
      if (node?.x === undefined || node.y === undefined) continue;
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
    }

    edgesRef.current.forEach((edge, index) => {
      const line = lineRefs.current[index];
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      if (!line || source?.x === undefined || source.y === undefined) return;
      if (target?.x === undefined || target.y === undefined) return;
      line.setAttribute("x1", String(source.x));
      line.setAttribute("y1", String(source.y));
      line.setAttribute("x2", String(target.x));
      line.setAttribute("y2", String(target.y));
    });

    const hovered = hoveredIdRef.current ? byId.get(hoveredIdRef.current) : undefined;
    const position = hovered && tooltipPosition(hovered, transformRef.current);
    if (position && tooltipRef.current) {
      tooltipRef.current.style.left = `${position.x}px`;
      tooltipRef.current.style.top = `${position.y}px`;
    }
  }, []);

  const { positioned, drag } = useForceSimulation(nodes, edges, width, height, moveToTick);
  const { transform, panBy, zoomAt, toWorld } = usePanZoom();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPointRef = useRef<Point | null>(null);
  // Refs, not state: starting a drag must not re-render the graph.
  const draggingIdRef = useRef<string | null>(null);
  const toWorldRef = useRef(toWorld);
  toWorldRef.current = toWorld;

  const byId = useMemo(() => new Map(positioned.map((node) => [node.id, node])), [positioned]);
  const hoveredNode = hoveredId ? byId.get(hoveredId) : undefined;

  byIdRef.current = byId;
  edgesRef.current = edges;
  transformRef.current = transform;
  hoveredIdRef.current = hoveredId;

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

  const { onDragStart, onDrag, onDragEnd } = drag;
  const nodeHandlers = useMemo<NodeHandlers>(
    () => ({
      onPointerDown(event) {
        const id = nodeIdOf(event.target);
        if (!id) return;
        const circle = event.target as SVGCircleElement;
        circle.setPointerCapture(event.pointerId);
        circle.style.cursor = "grabbing";
        draggingIdRef.current = id;
        onDragStart(id);
      },
      onPointerMove(event) {
        const id = draggingIdRef.current;
        const svg = svgRef.current;
        if (!id || !svg) return;
        const world = toWorldRef.current(toSvgPoint(svg, event));
        onDrag(id, world.x, world.y);
      },
      onPointerUp(event) {
        const id = draggingIdRef.current;
        if (!id) return;
        const circle = event.target as SVGCircleElement;
        if (circle.hasPointerCapture(event.pointerId)) circle.releasePointerCapture(event.pointerId);
        circle.style.cursor = "grab";
        draggingIdRef.current = null;
        onDragEnd(id);
      },
      onPointerOver(event) {
        const id = nodeIdOf(event.target);
        if (id) setHoveredId(id);
      },
      onPointerOut(event) {
        if (nodeIdOf(event.target)) setHoveredId(null);
      },
    }),
    [onDragStart, onDrag, onDragEnd],
  );

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
            <EdgeLayer edges={edges} byId={byId} lineRefs={lineRefs} />
            <NodeLayer positioned={positioned} circleRefs={circleRefs} handlers={nodeHandlers} />
          </g>
        </svg>
      )}
      {hoveredNode && <NodeTooltip ref={tooltipRef} node={hoveredNode} transform={transform} />}
    </div>
  );
}
