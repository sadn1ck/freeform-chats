export interface GraphPath {
  nodeIds: string[];
  depth: number;
}

export interface TraversalResult {
  paths: GraphPath[];
  visitedNodes: Set<string>;
}
