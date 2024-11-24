import { nanoid } from "nanoid";
import { proxy } from "valtio";
import type { CanvasItem, Connection } from "../types";
import { GraphPath } from "../types/graph";
import { GraphTraverser } from "../utils/graphTraversal";

interface CanvasStore {
  items: CanvasItem[];
  connections: Connection[];
  addItem: (item: Omit<CanvasItem, "id">) => string;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  addConnection: (connection: Omit<Connection, "id">) => void;
  removeConnection: (connectionId: string) => void;
}

function createCanvasStore(): CanvasStore {
  return proxy<CanvasStore>({
    items: [],
    connections: [],
    addItem(item) {
      const newItem = { ...item, id: nanoid(8) };
      this.items.push(newItem);
      return newItem.id;
    },
    updateItem(id, updates) {
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updates };
      }
    },
    addConnection(connection) {
      this.connections.push({ ...connection, id: nanoid(8) });
    },
    removeConnection(connectionId) {
      const index = this.connections.findIndex(
        (conn) => conn.id === connectionId
      );
      if (index !== -1) {
        this.connections.splice(index, 1);
      }
    },
  });
}

interface Tab {
  id: string;
}

interface TabsStore {
  tabsList: Tab[];
  stores: Record<string, CanvasStore>;
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  getTabStore: (id: string) => CanvasStore | undefined;
  getActiveStore: () => CanvasStore | undefined;
  findReversePaths: (itemId: string) => GraphPath[];
}

const initialTabId = nanoid(8);

export const tabsStore = proxy<TabsStore>({
  tabsList: [{ id: initialTabId }],
  stores: {
    [initialTabId]: createCanvasStore(),
  },
  activeTabId: initialTabId,

  addTab() {
    const newId = nanoid(8);
    this.tabsList.push({
      id: newId,
    });
    this.stores[newId] = createCanvasStore();
    this.activeTabId = newId;
  },

  removeTab(id: string) {
    const index = this.tabsList.findIndex((tab) => tab.id === id);
    if (index === -1 || this.tabsList.length === 1) return;

    this.tabsList.splice(index, 1);
    delete this.stores[id];

    if (this.activeTabId === id) {
      this.activeTabId = this.tabsList[Math.max(0, index - 1)].id;
    }
  },

  setActiveTab(id: string) {
    this.activeTabId = id;
  },

  getTabStore(id: string) {
    return this.stores[id];
  },

  getActiveStore() {
    return this.stores[this.activeTabId];
  },

  findReversePaths(itemId: string) {
    const store = this.getActiveStore();
    if (!store) return [];

    const traverser = new GraphTraverser(store.connections, store.items);
    return traverser.findReversePathsFrom(itemId);
  },
});
