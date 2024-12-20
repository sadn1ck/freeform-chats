import { useGesture } from "@use-gesture/react";
import { useCallback } from "react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";
import type { DragItem } from "../../types";
import { Arrows } from "./Arrows";
import { CanvasItem } from "./CanvasItem";
import { KeyHandler } from "./KeyHandler";
import { PasteHandler } from "./PasteHandler";

export function Canvas({ id: canvasId }: { id: string }) {
  const { stores } = useSnapshot(tabsStore);
  const canvas = stores[canvasId];

  const bind = useGesture({
    onDrop: ({ event }) => {
      const dragData = event.dataTransfer?.getData("toolbar-item-dnd");

      if (dragData) {
        const dragItem = JSON.parse(dragData) as DragItem;
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        tabsStore.addItem(canvasId, {
          type: dragItem.type,
          x,
          y,
          width: dragItem.width,
          height: dragItem.height,
          content: `[Enter partial prompt]`,
        });
      }
    },
  });

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        tabsStore.clearSelection(canvasId);
      }
    },
    [canvasId]
  );

  const isItemSelected = useCallback(
    (id: string) => canvas.selectedItemIds.includes(id),
    [canvas.selectedItemIds]
  );

  return (
    <div
      {...bind()}
      onClick={handleCanvasClick}
      onDragOver={(e) => e.preventDefault()}
      className="absolute inset-0 bg-[#fafafa] canvas-container"
    >
      <PasteHandler key={`paste-${canvasId}`} activeTabId={canvasId} />
      <KeyHandler key={`key-${canvasId}`} activeTabId={canvasId} />
      {canvas?.items.map((item) => (
        <CanvasItem
          key={item.id}
          item={item}
          isSelected={isItemSelected(item.id)}
        />
      ))}
      <Arrows />
      <pre className="top-1/3 left-1/2 -translate-x-1/2 absolute w-1/2 z-[0] opacity-70 pointer-events-none">
        {window.helpMessage}
      </pre>
    </div>
  );
}
