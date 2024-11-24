export type ItemType = 'text' | 'image';

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