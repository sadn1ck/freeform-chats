import { proxy } from 'valtio';
import { nanoid } from 'nanoid';
import type { CanvasItem } from '../types';

interface Tab {
  id: string;
  title: string;
  items: CanvasItem[];
}

interface TabsStore {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  addItemToActiveTab: (item: Omit<CanvasItem, 'id'>) => void;
  updateItemInActiveTab: (itemId: string, updates: Partial<CanvasItem>) => void;
}

export const tabsStore = proxy<TabsStore>({
  tabs: [{ id: nanoid(8), title: nanoid(8), items: [] }],
  activeTabId: '',
  
  addTab: () => {
    const newTab = { id: nanoid(8), title: nanoid(8), items: [] };
    tabsStore.tabs.push(newTab);
    tabsStore.activeTabId = newTab.id;
  },
  
  removeTab: (id: string) => {
    const index = tabsStore.tabs.findIndex(tab => tab.id === id);
    if (index === -1 || tabsStore.tabs.length === 1) return;
    
    tabsStore.tabs.splice(index, 1);
    if (tabsStore.activeTabId === id) {
      tabsStore.activeTabId = tabsStore.tabs[Math.max(0, index - 1)].id;
    }
  },
  
  setActiveTab: (id: string) => {
    tabsStore.activeTabId = id;
  },
  
  addItemToActiveTab: (item) => {
    const activeTab = tabsStore.tabs.find(tab => tab.id === tabsStore.activeTabId);
    if (!activeTab) return;
    
    const newItem = { ...item, id: nanoid(8) };
    activeTab.items.push(newItem);
  },
  
  updateItemInActiveTab: (itemId, updates) => {
    const activeTab = tabsStore.tabs.find(tab => tab.id === tabsStore.activeTabId);
    if (!activeTab) return;
    
    const itemIndex = activeTab.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      activeTab.items[itemIndex] = { ...activeTab.items[itemIndex], ...updates };
    }
  }
});