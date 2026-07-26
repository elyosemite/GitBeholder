import { useEffect, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { GraphEdge, GraphNode } from "@/features/commit-graph";

const COMMIT_RADIUS = 4;
const FILE_RADIUS = 8;
const LINK_DISTANCE = 60;
const CHARGE_STRENGTH = -150;

export interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: "commit" | "file";
  label: string;
  radius: number;
}

interface SimLink {
  source: string;
  target: string;
}

/**
 * Runs a d3-force simulation over an abstract node/edge graph and
 * returns the current node positions, updated on every tick. React owns
 * the DOM (see ForceGraph) — this hook only computes numbers, so future
 * filters/grouping can reshape `nodes`/`edges` before they reach here
 * without touching the physics.
 *
 * Files act as hubs with no special-cased force: a file touched by many
 * commits accumulates many `forceLink` constraints pulling toward it,
 * which is enough on its own to produce the hub effect in a bipartite
 * force-directed layout.
 */
export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): SimNode[] {
  const [positioned, setPositioned] = useState<SimNode[]>([]);

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
    }));

    const simLinks: SimLink[] = edges.map((edge) => ({ source: edge.source, target: edge.target }));

    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((node) => node.id)
          .distance(LINK_DISTANCE),
      )
      .force("charge", forceManyBody().strength(CHARGE_STRENGTH))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide<SimNode>((node) => node.radius + 4))
      .on("tick", () => setPositioned([...simNodes]));

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height]);

  return positioned;
}
