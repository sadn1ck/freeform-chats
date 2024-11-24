import { useGesture } from "@use-gesture/react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";
import type { DragItem } from "../../types";
import { Arrows } from "./Arrows";
import { CanvasItem } from "./CanvasItem";
import { PasteHandler } from "./PasteHandler";

export function Canvas() {
  const { activeTabId, stores } = useSnapshot(tabsStore);
  const store = stores[activeTabId];

  const bind = useGesture({
    onDrop: ({ event }) => {
      const dragData = event.dataTransfer?.getData("toolbar-item-dnd");

      if (dragData) {
        const dragItem = JSON.parse(dragData) as DragItem;
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        tabsStore.getActiveStore()?.addItem({
          type: dragItem.type,
          x,
          y,
          width: dragItem.width,
          height: dragItem.height,
          content: `I'm not an expert ... But after viewing and analyzing the post from beginning to end, line by line word by word, letter by letter I came to the conclusion and I can say, that I can't say anything because as I said at the beginning, I'm not an expert.`,
        });
      }
    },
  });

  return (
    <div
      {...bind()}
      onDragOver={(e) => e.preventDefault()}
      className="absolute inset-0 bg-[#fafafa] canvas-container"
    >
      <PasteHandler />
      {store?.items.map((item) => (
        <CanvasItem key={item.id} item={item} />
      ))}
      <Arrows />
    </div>
  );
}
