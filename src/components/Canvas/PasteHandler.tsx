import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";
import { DEFAULT_ITEM_SIZE, findEmptySpace } from "../../utils/canvasLayout";

export function PasteHandler({ activeTabId }: { activeTabId: string }) {
  const { stores } = useSnapshot(tabsStore);
  const store = stores[activeTabId];

  // Use ref to get canvas size since it might change
  const canvasSizeRef = useRef({ width: 2000, height: 2000 });

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const text = e.clipboardData?.getData("text");
      if (!text?.trim()) return;

      const position = findEmptySpace(
        store.items.map((item) => ({
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        })),
        DEFAULT_ITEM_SIZE,
        canvasSizeRef.current
      );

      tabsStore.addItem(activeTabId, {
        type: "user",
        content: text,
        height: DEFAULT_ITEM_SIZE.height,
        width: DEFAULT_ITEM_SIZE.width,
        x: position.x,
        y: position.y,
      });
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [store]);

  // Update canvas size on resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = document.querySelector(".canvas-container");
      if (canvas) {
        canvasSizeRef.current = {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
        };
      }
    };

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return null;
}
