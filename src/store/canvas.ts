import { proxy } from 'valtio';
import type { CanvasItem } from '../types';

interface CanvasStore {
  items: CanvasItem[];
  addItem: (item: Omit<CanvasItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
}

export const canvasStore = proxy<CanvasStore>({
  items: [],
  addItem: (item) => {
    const id = Math.random().toString(36).substring(7);
    canvasStore.items.push({ ...item, id });
  },
  updateItem: (id, updates) => {
    const index = canvasStore.items.findIndex(item => item.id === id);
    if (index !== -1) {
      canvasStore.items[index] = { ...canvasStore.items[index], ...updates };
    }
  }
});