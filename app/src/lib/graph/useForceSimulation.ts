import { useCallback, useEffect, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";
import { forceFileGravity } from "./forceFileGravity";

const COMMIT_RADIUS = 4;
const FILE_RADIUS = 8;
// Files repel each other strongly (keeps the "main" vertices at a
// readable distance apart) while commits barely repel anything (so
// gravity can actually hold them in a tight ring instead of the crowd
// pushing itself apart) - a single shared charge strength was pushing
// files just as far apart as it pushed commits apart, which read as
// everything scattering rather than a legible hub-and-ring shape.
const FILE_CHARGE_STRENGTH = -400;
const COMMIT_CHARGE_STRENGTH = -20;
const DRAG_ALPHA_TARGET = 0.3;

export const MIN_GRAVITY_STRENGTH = 0;
export const MAX_GRAVITY_STRENGTH = 0.2;
export const DEFAULT_GRAVITY_STRENGTH = 0.03;

export interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: "commit" | "file";
  label: string;
  radius: number;
  /** The original node, for rendering hover details (hash/author/timestamp or name). */
  data: GraphNode;
}

interface SimLink {
  source: string;
  target: string;
}

export interface DragControls {
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
}

/**
 * Runs a d3-force simulation over an abstract node/edge graph and
 * returns the current node positions, updated on every tick, plus drag
 * controls. React owns the DOM (see ForceGraph) — this hook only
 * computes numbers, so future filters/grouping can reshape
 * `nodes`/`edges` before they reach here without touching the physics.
 *
 * Files act as hubs via `forceFileGravity` (a custom force, see that
 * module): each file gravitationally attracts its connected commits,
 * with forceManyBody's repulsion and forceCollide's no-overlap pushing
 * back — the ring of commits around a file is that equilibrium, not
 * anything drawn explicitly. Dragging a node pulls its linked
 * neighbors along for the same reason, once the simulation is reheated.
 */
export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  gravityStrength: number = DEFAULT_GRAVITY_STRENGTH,
): { positioned: SimNode[]; drag: DragControls } {
  const [positioned, setPositioned] = useState<SimNode[]>([]);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    if (width === 0 || height === 0 || nodes.length === 0) {
      setPositioned([]);
      simulationRef.current = null;
      return;
    }

    const simNodes: SimNode[] = nodes.map((node) => ({
      id: node.id,
      kind: node.type,
      label: node.type === "commit" ? node.hash.slice(0, 7) : node.name,
      radius: node.type === "file" ? FILE_RADIUS : COMMIT_RADIUS,
      data: node,
    }));

    const simLinks: SimLink[] = edges.map((edge) => ({ source: edge.source, target: edge.target }));

    const simulation = forceSimulation<SimNode, SimLink>(simNodes)
      .force("gravity", forceFileGravity(simLinks, gravityStrength))
      .force(
        "charge",
        forceManyBody<SimNode>().strength((node) =>
          node.kind === "file" ? FILE_CHARGE_STRENGTH : COMMIT_CHARGE_STRENGTH,
        ),
      )
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide<SimNode>((node) => node.radius + 4))
      .on("tick", () => setPositioned([...simNodes]));

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [nodes, edges, width, height, gravityStrength]);

  // Canonical d3-force drag pattern: reheat with alphaTarget so the
  // simulation keeps ticking while a node is pinned to the pointer,
  // pin the dragged node via fx/fy, release both on drag end.
  const onDragStart = useCallback((id: string) => {
    const simulation = simulationRef.current;
    const node = simulation?.nodes().find((n) => n.id === id);
    if (!simulation || !node) return;

    simulation.alphaTarget(DRAG_ALPHA_TARGET).restart();
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const onDrag = useCallback((id: string, x: number, y: number) => {
    const node = simulationRef.current?.nodes().find((n) => n.id === id);
    if (!node) return;

    node.fx = x;
    node.fy = y;
  }, []);

  const onDragEnd = useCallback((id: string) => {
    const simulation = simulationRef.current;
    const node = simulation?.nodes().find((n) => n.id === id);
    if (!simulation || !node) return;

    simulation.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  }, []);

  return { positioned, drag: { onDragStart, onDrag, onDragEnd } };
}
