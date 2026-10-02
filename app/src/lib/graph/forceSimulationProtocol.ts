/** Messages between useForceSimulation (main thread) and its worker. */

export interface WorkerNode {
  id: string;
  radius: number;
}

export interface WorkerLink {
  source: string;
  target: string;
}

export type ToWorker =
  | { type: "init"; nodes: WorkerNode[]; links: WorkerLink[]; width: number; height: number }
  | { type: "dragStart"; index: number }
  | { type: "drag"; index: number; x: number; y: number }
  | { type: "dragEnd"; index: number };

/** `positions` holds x,y pairs in node order: [x0, y0, x1, y1, ...]. */
export type FromWorker = { type: "positions"; positions: Float32Array };
