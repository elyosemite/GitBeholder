import { useCallback, useEffect, useRef, useState } from "react";
import type { SimulationNodeDatum } from "d3-force";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";
import type { FromWorker, ToWorker } from "./forceSimulationProtocol";

const COMMIT_RADIUS = 4;
const FILE_RADIUS = 8;

export interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: "commit" | "file";
  label: string;
  radius: number;
  /** The original node, for rendering hover details (hash/author/timestamp or name). */
  data: GraphNode;
}

export interface DragControls {
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
}

/**
 * Runs a d3-force simulation over an abstract node/edge graph and
 * returns its nodes, plus drag controls. The physics runs in a Web Worker
 * (forceSimulation.worker.ts) so a large graph's ~300 settling ticks
 * don't freeze the UI; positions come back as a Float32Array and are
 * copied onto each node's x/y at most once per animation frame.
 *
 * `positioned` changes once per layout, not per tick: after the first
 * positions arrive, each later update calls `onTick` so the caller moves
 * its existing DOM nodes directly instead of re-rendering. Future
 * filters/grouping can still reshape `nodes`/`edges` before they reach
 * here without touching the physics.
 *
 * Files act as hubs with no special-cased force: a file touched by many
 * commits accumulates many `forceLink` constraints pulling toward it,
 * which is enough on its own to produce the hub effect in a bipartite
 * force-directed layout — dragging a node pulls its linked neighbors
 * along for the same reason, once the simulation is reheated.
 */
export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  onTick: () => void,
): { positioned: SimNode[]; drag: DragControls } {
  const [positioned, setPositioned] = useState<SimNode[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const indexByIdRef = useRef(new Map<string, number>());
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (width === 0 || height === 0 || nodes.length === 0) {
      setPositioned([]);
      return;
    }

    const simNodes: SimNode[] = nodes.map((node) => ({
      id: node.id,
      kind: node.type,
      label: node.type === "commit" ? node.hash.slice(0, 7) : node.name,
      radius: node.type === "file" ? FILE_RADIUS : COMMIT_RADIUS,
      data: node,
    }));
    indexByIdRef.current = new Map(simNodes.map((node, index) => [node.id, index]));

    const worker = new Worker(new URL("./forceSimulation.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    // The worker may post faster than the screen refreshes; only the
    // latest positions matter, applied once per frame.
    let latest: Float32Array | null = null;
    let frame = 0;
    let shown = false;

    const applyLatest = () => {
      frame = 0;
      if (!latest) return;
      simNodes.forEach((node, index) => {
        node.x = latest![index * 2];
        node.y = latest![index * 2 + 1];
      });
      latest = null;

      if (shown) {
        onTickRef.current();
      } else {
        shown = true;
        setPositioned(simNodes);
      }
    };

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      latest = event.data.positions;
      if (!frame) frame = requestAnimationFrame(applyLatest);
    };

    const init: ToWorker = {
      type: "init",
      nodes: simNodes.map((node) => ({ id: node.id, radius: node.radius })),
      links: edges.map((edge) => ({ source: edge.source, target: edge.target })),
      width,
      height,
    };
    worker.postMessage(init);

    return () => {
      cancelAnimationFrame(frame);
      worker.terminate();
      workerRef.current = null;
    };
  }, [nodes, edges, width, height]);

  const post = useCallback((message: ToWorker) => workerRef.current?.postMessage(message), []);

  const onDragStart = useCallback(
    (id: string) => {
      const index = indexByIdRef.current.get(id);
      if (index !== undefined) post({ type: "dragStart", index });
    },
    [post],
  );

  const onDrag = useCallback(
    (id: string, x: number, y: number) => {
      const index = indexByIdRef.current.get(id);
      if (index !== undefined) post({ type: "drag", index, x, y });
    },
    [post],
  );

  const onDragEnd = useCallback(
    (id: string) => {
      const index = indexByIdRef.current.get(id);
      if (index !== undefined) post({ type: "dragEnd", index });
    },
    [post],
  );

  return { positioned, drag: { onDragStart, onDrag, onDragEnd } };
}
