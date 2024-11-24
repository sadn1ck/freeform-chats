import { nanoid } from "nanoid";
import { proxy } from "valtio";
import type { CanvasItem, Connection } from "../types";
import { GraphPath } from "../types/graph";
import { GraphTraverser } from "../utils/graphTraversal";

interface Tab {
  id: string;
  title: string;
  items: CanvasItem[];
  connections: Connection[];
}

interface TabsStore {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  addItemToActiveTab: (item: Omit<CanvasItem, "id">) => void;
  updateItemInActiveTab: (itemId: string, updates: Partial<CanvasItem>) => void;
  addConnection: (connection: Omit<Connection, "id">) => void;
  removeConnection: (connectionId: string) => void;
  findReversePaths: (itemId: string) => GraphPath[];
}

export const tabsStore = proxy<TabsStore>({
  tabs: [{ id: nanoid(8), title: nanoid(8), items: [], connections: [] }],
  activeTabId: "",

  addTab() {
    const newTab = {
      id: nanoid(8),
      title: nanoid(8),
      items: [],
      connections: [],
    };
    this.tabs.push(newTab);
    this.activeTabId = newTab.id;
  },

  removeTab(id: string) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1 || this.tabs.length === 1) return;

    this.tabs.splice(index, 1);
    if (this.activeTabId === id) {
      this.activeTabId = this.tabs[Math.max(0, index - 1)].id;
    }
  },

  setActiveTab(id: string) {
    this.activeTabId = id;
  },

  addItemToActiveTab(item) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return;

    const newItem = { ...item, id: nanoid(8) };
    activeTab.items.push(newItem);
  },

  updateItemInActiveTab(itemId, updates) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return;

    const itemIndex = activeTab.items.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      activeTab.items[itemIndex] = {
        ...activeTab.items[itemIndex],
        ...updates,
      };
    }
  },

  addConnection(connection) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return;

    activeTab.connections.push({ ...connection, id: nanoid(8) });
  },

  removeConnection(connectionId) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return;

    const index = activeTab.connections.findIndex(
      (conn) => conn.id === connectionId
    );
    if (index !== -1) {
      activeTab.connections.splice(index, 1);
    }
  },

  findReversePaths(itemId: string) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return [];

    const traverser = new GraphTraverser(
      activeTab.connections,
      activeTab.items
    );
    return traverser.findReversePathsFrom(itemId);
  },
});
