export interface CommitNode {
  id: string;
  type: "commit";
  hash: string;
  author: string;
  timestamp: string;
}

export interface FileNode {
  id: string;
  type: "file";
  name: string;
}

export type GraphNode = CommitNode | FileNode;

export interface GraphEdge {
  source: string;
  target: string;
}

export interface CommitGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truncated: boolean;
}
