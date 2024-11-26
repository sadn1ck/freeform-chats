import { nanoid } from "nanoid";
import { proxy, subscribe } from "valtio";
import type { AsyncIterableStream, CanvasItem, Connection } from "../types";
import { GraphPath } from "../types/graph";
import { GraphTraverser } from "../utils/graphTraversal";

interface TabCanvas {
  items: CanvasItem[];
  connections: Connection[];
  selectedItemIds: string[];
}

function createDefaultCanvas(): TabCanvas {
  return {
    items: [],
    connections: [],
    selectedItemIds: [],
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
  modelId: string;
}

const initialTabId = nanoid(8);

const STORE_KEYS = {
  apiKey: "v1_apiKey",
  activeTabId: "v1_activeTabId",
  tabsList: "v1_tabsList",
  stores: "v1_stores",
  modelId: "v1_modelId",
};

type InitialState = Pick<
  TabsStore,
  "apiKey" | "activeTabId" | "stores" | "tabsList" | "modelId"
>;

function getInitialState(): InitialState {
  return {
    stores: {
      [initialTabId]: createDefaultCanvas(),
    },
    tabsList: [{ id: initialTabId }],
    activeTabId: initialTabId,
    apiKey: "",
    modelId: "gpt-4o-mini",
  };
}

function getExistingState(): InitialState {
  console.log("[dbg] getting existing state");
  try {
    const apiKey = localStorage.getItem(STORE_KEYS.apiKey) ?? "";
    const modelId = localStorage.getItem(STORE_KEYS.modelId) ?? "gpt-4o-mini";
    const activeTabId =
      localStorage.getItem(STORE_KEYS.activeTabId) ?? initialTabId;
    const tabsList = JSON.parse(
      localStorage.getItem(STORE_KEYS.tabsList) ?? "[]"
    ) as Tab[];
    const stores = JSON.parse(
      localStorage.getItem(STORE_KEYS.stores) ?? "{}"
    ) as Record<string, TabCanvas>;

    if (!activeTabId || !tabsList || tabsList.length === 0 || !stores) {
      return getInitialState();
    }

    const parsedTabsList = tabsList.filter(
      (tab: { id: string }) => tab.id && typeof stores[tab.id] === "object"
    );

    if (parsedTabsList.length === 0) {
      return getInitialState();
    }

    return {
      apiKey: apiKey ?? "",
      activeTabId,
      tabsList,
      stores,
      modelId,
    };
  } catch (e) {
    return getInitialState();
  }
}

function createTabsStore(): TabsStore {
  const existingState = getExistingState();
  const init = proxy<TabsStore>({
    stores: existingState.stores,
    tabsList: existingState.tabsList,
    activeTabId: existingState.activeTabId,
    apiKey: existingState.apiKey,
    modelId: existingState.modelId,
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
      if (updates.x) updates.x = Math.max(0, updates.x);
      if (updates.y) updates.y = Math.max(0, updates.y);
      if (index !== -1) {
        canvas.items[index] = {
          ...canvas.items[index],
          ...updates,
        };
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

      canvas.selectedItemIds = [id];
    },

    clearSelection(targetCanvas: string): void {
      const canvas = this.stores[targetCanvas];
      if (!canvas) throw new Error("Canvas not found");

      canvas.selectedItemIds = [];
    },

    removeItems(tabId: string, itemIds: string[]): void {
      const store = this.stores[tabId];
      store.items = store.items.filter((item) => !itemIds.includes(item.id));
      store.selectedItemIds = store.selectedItemIds.filter(
        (id) => !itemIds.includes(id)
      );
    },

    async addToContent(
      tabId: string,
      itemId: string,
      stream: AsyncIterableStream<string>
    ): Promise<void> {
      const store = this.stores[tabId];
      const index = store.items.findIndex((i) => i.id === itemId);
      if (index === -1) return;

      let buffer = "";
      for await (const chunk of stream) {
        buffer += chunk;
        if (buffer.length >= 5) {
          store.items[index].content += buffer;
          buffer = "";
        }
      }
      if (buffer.length > 0) {
        store.items[index].content += buffer;
      }
      console.groupEnd();
    },
  });
  return init;
}

export const tabsStore = createTabsStore();

subscribe(tabsStore, () => {
  localStorage.setItem(STORE_KEYS.modelId, tabsStore.modelId);
  localStorage.setItem(STORE_KEYS.apiKey, tabsStore.apiKey);
  localStorage.setItem(STORE_KEYS.activeTabId, tabsStore.activeTabId);
  localStorage.setItem(STORE_KEYS.tabsList, JSON.stringify(tabsStore.tabsList));
  localStorage.setItem(STORE_KEYS.stores, JSON.stringify(tabsStore.stores));
});
