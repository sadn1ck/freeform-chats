import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";

export function KeyHandler({ activeTabId }: { activeTabId: string }) {
  const { stores } = useSnapshot(tabsStore);
  const store = stores[activeTabId];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Backspace" && store.selectedItemIds.size > 0) {
        e.preventDefault();
        tabsStore.removeItems(activeTabId, Array.from(store.selectedItemIds));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [store]);

  return null;
}
