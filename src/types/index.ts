export type ItemType = "text" | "image";

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePosition: "top" | "right" | "bottom" | "left";
  targetPosition: "top" | "right" | "bottom" | "left";
}

export interface CanvasItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
}

export interface DragItem {
  type: ItemType;
  width: number;
  height: number;
}
