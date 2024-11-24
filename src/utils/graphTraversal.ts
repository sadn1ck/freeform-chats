import type { CanvasItem, Connection } from "../types";
import type { GraphPath } from "../types/graph";

export class GraphTraverser {
  private connections: Connection[];
  private items: CanvasItem[];
  private maxPaths: number;

  constructor(connections: Connection[], items: CanvasItem[], maxPaths = 5) {
    this.connections = connections;
    this.items = items;
    this.maxPaths = maxPaths;
  }

  findReversePathsFrom(startNodeId: string): GraphPath[] {
    const visited = new Set<string>();
    const paths: GraphPath[] = [];

    this.traverseReverse(startNodeId, [], visited, paths);

    // Sort by depth (longest paths first) and take maxPaths
    return paths.sort((a, b) => b.depth - a.depth).slice(0, this.maxPaths);
  }

  private traverseReverse(
    currentId: string,
    currentPath: string[],
    visited: Set<string>,
    paths: GraphPath[]
  ): void {
    // Add current node to path
    currentPath.push(currentId);
    visited.add(currentId);

    // Find all nodes that point to current node
    const incomingConnections = this.connections.filter(
      (conn) => conn.targetId === currentId
    );

    if (incomingConnections.length === 0) {
      // We found a root node (nothing points to it)
      paths.push({
        nodeIds: [...currentPath],
        depth: currentPath.length,
      });
    } else {
      // Continue traversing through each incoming connection
      for (const conn of incomingConnections) {
        if (!visited.has(conn.sourceId)) {
          this.traverseReverse(
            conn.sourceId,
            [...currentPath],
            new Set(visited),
            paths
          );
        }
      }
    }
  }

  // Helper method to get item details for a path
  getPathDetails(path: GraphPath): CanvasItem[] {
    return path.nodeIds
      .map((id) => this.items.find((item) => item.id === id))
      .filter((item): item is CanvasItem => item !== undefined);
  }
}
