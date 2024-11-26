import { nanoid } from "nanoid";
import { proxy } from "valtio";
import { proxySet } from "valtio/utils";
import type { AsyncIterableStream, CanvasItem, Connection } from "../types";
import { GraphPath } from "../types/graph";
import { GraphTraverser } from "../utils/graphTraversal";

interface TabCanvas {
  items: CanvasItem[];
  connections: Connection[];
  selectedItemIds: Set<string>;
}

function createDefaultCanvas(): TabCanvas {
  return {
    items: [],
    connections: [],
    selectedItemIds: proxySet<string>(),
  };
}

interface Tab {
  id: string;
}

interface TabsStore {
  tabsList: Tab[];
  stores: Record<string, TabCanvas>;
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  getTabStore: (id: string) => TabCanvas | undefined;
  getActiveCanvas: () => TabCanvas | undefined;
  findReversePaths: (itemId: string) => GraphPath[];

  // canvas
  addItem: (targetCanvas: string, item: Omit<CanvasItem, "id">) => string;
  updateItem: (
    targetCanvas: string,
    id: string,
    updates: Partial<CanvasItem>
  ) => void;
  addConnection: (
    targetCanvas: string,
    connection: Omit<Connection, "id">
  ) => void;
  removeConnection: (targetCanvas: string, connectionId: string) => void;
  selectItem: (targetCanvas: string, id: string) => void;
  clearSelection: (targetCanvas: string) => void;
  removeItems: (tabId: string, itemIds: string[]) => void;

  // ai
  addToContent: (
    tabId: string,
    itemId: string,
    stream: AsyncIterableStream<string>
  ) => Promise<void>;

  apiKey: string;
}

const initialTabId = nanoid(8);

export const tabsStore = proxy<TabsStore>({
  stores: {
    [initialTabId]: createDefaultCanvas(),
  },
  tabsList: [{ id: initialTabId }],
  activeTabId: initialTabId,
  apiKey: "",

  addTab() {
    const newId = nanoid(8);
    this.tabsList.push({
      id: newId,
    });
    this.stores[newId] = createDefaultCanvas();
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

  getActiveCanvas() {
    return this.stores[this.activeTabId];
  },

  findReversePaths(itemId: string) {
    const store = this.getActiveCanvas();
    if (!store) return [];

    const traverser = new GraphTraverser(store.connections, store.items);
    return traverser.findReversePathsFrom(itemId);
  },

  addItem(targetCanvas: string, item: Omit<CanvasItem, "id">): string {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    const newItem = { ...item, id: nanoid(8) };
    canvas.items.push(newItem);
    return newItem.id;
  },

  updateItem(
    targetCanvas: string,
    id: string,
    updates: Partial<CanvasItem>
  ): void {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    const index = canvas.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      canvas.items[index] = { ...canvas.items[index], ...updates };
    }
  },

  addConnection(
    targetCanvas: string,
    connection: Omit<Connection, "id">
  ): void {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    canvas.connections.push({ ...connection, id: nanoid(8) });
  },

  removeConnection(targetCanvas: string, connectionId: string): void {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    const index = canvas.connections.findIndex(
      (conn) => conn.id === connectionId
    );
    if (index !== -1) {
      canvas.connections.splice(index, 1);
    }
  },

  selectItem(targetCanvas: string, id: string): void {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    canvas.selectedItemIds.clear();
    canvas.selectedItemIds.add(id);
  },

  clearSelection(targetCanvas: string): void {
    const canvas = this.stores[targetCanvas];
    if (!canvas) throw new Error("Canvas not found");

    if (canvas.selectedItemIds.size > 0) {
      canvas.selectedItemIds.clear();
    }
  },

  removeItems(tabId: string, itemIds: string[]): void {
    const store = this.stores[tabId];
    store.items = store.items.filter((item) => !itemIds.includes(item.id));
    itemIds.forEach((id) => store.selectedItemIds.delete(id));
  },

  async addToContent(
    tabId: string,
    itemId: string,
    stream: AsyncIterableStream<string>
  ): Promise<void> {
    const store = this.stores[tabId];
    const item = store.items.find((i) => i.id === itemId);
    if (!item) return;

    for await (const chunk of stream) {
      item.content += chunk;
    }
  },
});

// subscribe(tabsStore, () => {
//   clientStore.set("apiKey", tabsStore.apiKey);
//   clientStore.set("activeTabId", tabsStore.activeTabId);
//   clientStore.set("tabsList", tabsStore.tabsList);
//   Object.keys(tabsStore.stores).forEach((tabId) => {
//     clientStore.set(tabId, tabsStore.stores[tabId]);
//   });
// });
