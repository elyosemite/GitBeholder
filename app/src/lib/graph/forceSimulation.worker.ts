import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { FromWorker, ToWorker, WorkerLink } from "./forceSimulationProtocol";

/**
 * Runs the d3-force physics off the main thread. With ~1,700 nodes a
 * tick costs tens of milliseconds, and a layout takes ~300 ticks — on the
 * main thread that froze the UI for seconds every time the graph opened.
 * Each tick posts the node positions back; useForceSimulation applies
 * them at most once per frame.
 */

const LINK_DISTANCE = 60;
const CHARGE_STRENGTH = -150;
const DRAG_ALPHA_TARGET = 0.3;

interface Node extends SimulationNodeDatum {
  id: string;
  radius: number;
}

// Typed locally: the app's tsconfig uses the DOM lib, not WebWorker.
const scope = self as unknown as {
  postMessage(message: FromWorker, transfer: Transferable[]): void;
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
};

let simulation: Simulation<Node, WorkerLink> | null = null;
let nodes: Node[] = [];

function postPositions() {
  const positions = new Float32Array(nodes.length * 2);
  nodes.forEach((node, index) => {
    positions[index * 2] = node.x ?? 0;
    positions[index * 2 + 1] = node.y ?? 0;
  });
  scope.postMessage({ type: "positions", positions }, [positions.buffer]);
}

scope.onmessage = (event) => {
  const message = event.data;

  switch (message.type) {
    case "init": {
      simulation?.stop();
      nodes = message.nodes.map((node) => ({ id: node.id, radius: node.radius }));
      simulation = forceSimulation(nodes)
        .force(
          "link",
          forceLink<Node, WorkerLink>(message.links)
            .id((node) => node.id)
            .distance(LINK_DISTANCE),
        )
        .force("charge", forceManyBody().strength(CHARGE_STRENGTH))
        .force("center", forceCenter(message.width / 2, message.height / 2))
        .force("collide", forceCollide<Node>((node) => node.radius + 4))
        .on("tick", postPositions);
      // Initial positions right away, so the graph renders before the
      // first tick lands.
      postPositions();
      break;
    }

    // Canonical d3-force drag pattern: reheat with alphaTarget so the
    // simulation keeps ticking while a node is pinned to the pointer,
    // pin the dragged node via fx/fy, release both on drag end.
    case "dragStart": {
      const node = nodes[message.index];
      if (!simulation || !node) return;
      simulation.alphaTarget(DRAG_ALPHA_TARGET).restart();
      node.fx = node.x;
      node.fy = node.y;
      break;
    }

    case "drag": {
      const node = nodes[message.index];
      if (!node) return;
      node.fx = message.x;
      node.fy = message.y;
      break;
    }

    case "dragEnd": {
      const node = nodes[message.index];
      if (!simulation || !node) return;
      simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
      break;
    }
  }
};
