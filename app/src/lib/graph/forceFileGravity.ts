import type { SimNode } from "./useForceSimulation";

interface GravityLink {
  source: string;
  target: string;
}

/**
 * Custom d3-force: a file gravitationally attracts its connected
 * commits, and is pulled back toward them in turn (Newton's third law) —
 * unlike forceLink, there's no rest length, so the pull never "turns
 * off" once a target distance is reached. Left alone, gravity alone
 * would collapse every commit onto its file; the ring shape is the
 * equilibrium against forceManyBody's repulsion and forceCollide's
 * no-overlap, not something drawn explicitly.
 *
 * Strength is linear in distance (`F = k·d`), not inverse-square like
 * real gravity: an inverse-square pull is near-zero for anything not
 * already close, so a commit that drifts far from its file (e.g. during
 * the initial layout, or after a drag) would never get reeled back in
 * against the constant-strength repulsion. Linear "gravity" is also
 * what most force-directed graph tools mean by the term (Gephi's
 * ForceAtlas2, vis-network's gravitationalConstant) — it keeps a
 * cluster cohesive regardless of how far a node has strayed.
 *
 * Implements the d3-force custom force contract: a function called
 * with the current `alpha` each tick, plus an `initialize(nodes)` hook
 * to resolve node ids into live node references once.
 * https://d3js.org/d3-force/module#force
 */
export function forceFileGravity(links: GravityLink[], strength: number) {
  let nodesById = new Map<string, SimNode>();

  function force(alpha: number) {
    const pull = strength * alpha;

    for (const link of links) {
      const commit = nodesById.get(link.source);
      const file = nodesById.get(link.target);
      if (!commit || !file) continue;
      if (commit.x === undefined || commit.y === undefined) continue;
      if (file.x === undefined || file.y === undefined) continue;

      const dx = file.x - commit.x;
      const dy = file.y - commit.y;

      commit.vx = (commit.vx ?? 0) + dx * pull;
      commit.vy = (commit.vy ?? 0) + dy * pull;
      file.vx = (file.vx ?? 0) - dx * pull;
      file.vy = (file.vy ?? 0) - dy * pull;
    }
  }

  force.initialize = (nodes: SimNode[]) => {
    nodesById = new Map(nodes.map((node) => [node.id, node]));
  };

  return force;
}
