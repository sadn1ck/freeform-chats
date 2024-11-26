import * as Dialog from "@radix-ui/react-dialog";
import { useDrag } from "@use-gesture/react";
import { TrashIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../../lib/utils";
import { tabsStore } from "../../store/tabs";
import type { CanvasItem as CanvasItemType, ItemType } from "../../types";
import { constructPrompt, streamPromptResponse } from "../../utils/ai";
import { DEFAULT_ITEM_SIZE } from "../../utils/canvasLayout";
import { Textarea } from "../ui/textarea";
import { ConnectionPoint } from "./ConnectionPoint";

interface Props {
  item: CanvasItemType;
  isSelected: boolean;
}

const getClosestPosition = (
  x: number,
  y: number,
  itemWidth: number,
  itemHeight: number
) => {
  const points = {
    top: { x: itemWidth / 2, y: 0, position: "top" },
    right: { x: itemWidth, y: itemHeight / 2, position: "right" },
    bottom: { x: itemWidth / 2, y: itemHeight, position: "bottom" },
    left: { x: 0, y: itemHeight / 2, position: "left" },
  };

  let closest = "top";
  let minDistance = Infinity;

  Object.entries(points).forEach(([pos, point]) => {
    const distance = Math.hypot(x - point.x, y - point.y);
    if (distance < minDistance) {
      minDistance = distance;
      closest = pos;
    }
  });

  return closest as "top" | "right" | "bottom" | "left";
};

export function CanvasItem({ item, isSelected }: Props) {
  const { activeTabId, stores } = useSnapshot(tabsStore);
  const [deep, setDeep] = useState(false);

  const store = stores[activeTabId];

  const ref = useRef<HTMLDivElement>(null);

  useDrag(
    ({ movement: [x, y], first, memo = { x: item.x, y: item.y }, event }) => {
      if (event?.target) {
        const t = event.target as HTMLElement;
        if (t.tagName === "TEXTAREA") {
          return memo;
        }
      }
      if (first) {
        memo = { x: item.x, y: item.y };
      }

      if (Math.abs(x) >= 5 || Math.abs(y) >= 5) {
        tabsStore.updateItem(activeTabId, item.id, {
          x: memo.x + x,
          y: memo.y + y,
        });
      }

      return memo;
    },
    {
      pointer: {
        keys: false,
      },
      target: ref,
    }
  );

  const handleTraverseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const paths = tabsStore.findReversePaths(item.id);
    if (!store) return;

    paths.forEach((path) => {
      const partialPrompt: { type: ItemType; content: string }[] = [];
      const nodeIds = [...path.nodeIds].reverse();

      nodeIds.forEach((nodeId) => {
        const node = store.items.find((item) => item.id === nodeId);
        partialPrompt.push({
          type: node?.type ?? "user",
          content: node?.content ?? "",
        });
      });

      const lastNode = store.items.find(
        (item) => item.id === nodeIds[nodeIds.length - 1]
      );
      if (lastNode) {
        const newItemId = tabsStore.addItem(activeTabId, {
          type: "assistant",
          x: lastNode.x,
          y: lastNode.y + lastNode.height + 60,
          width: DEFAULT_ITEM_SIZE.width,
          height: DEFAULT_ITEM_SIZE.height,
          content: "",
        });
        tabsStore.addConnection(activeTabId, {
          sourceId: lastNode.id,
          targetId: newItemId,
          sourcePosition: "bottom",
          targetPosition: "top",
        });
        tabsStore.addToContent(
          activeTabId,
          newItemId,
          streamPromptResponse(constructPrompt(partialPrompt))
        );
      }
    });
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    tabsStore.updateItem(activeTabId, item.id, {
      content: e.target.value,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    tabsStore.selectItem(activeTabId, item.id);
    e.stopPropagation();
  };

  const words = Array.from(
    new Intl.Segmenter("en", { granularity: "word" }).segment(
      item.content ?? ""
    )
  ).filter((part) => part.isWordLike);

  return (
    <div
      ref={ref}
      data-canvas-item-id={item.id}
      onClick={handleClick}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const connectionData = e.dataTransfer?.getData("connection");
        if (connectionData) {
          const connection = JSON.parse(connectionData);
          if (connection.sourceId !== item.id) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const targetPosition = getClosestPosition(
              x,
              y,
              item.width,
              item.height
            );

            tabsStore.addConnection(activeTabId, {
              sourceId: connection.sourceId,
              targetId: item.id,
              sourcePosition: connection.position,
              targetPosition,
            });
          }
        }
      }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${item.x}px, ${item.y}px)`,
        width: item.width,
        height: item.height,
        cursor: "move",
        backgroundColor:
          item.type === "system"
            ? "rgba(240, 240, 240, 0.5)"
            : item.type === "assistant"
            ? "rgba(181, 239, 169, 0.5)"
            : "rgba(155, 189, 232, 0.5)",
        boxShadow: isSelected ? "0 0 0 2px #2563eb" : "0 0 0 1px #ccc",
        borderRadius: "4px",
        userSelect: "none",
        touchAction: "none",
      }}
      className="canvas-item group/canvas-item backdrop-blur-md p-1 z-10"
    >
      <Dialog.Root open={deep} onOpenChange={setDeep}>
        <Dialog.Trigger className="absolute top-0 right-0"></Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md min-w-[560px] min-h-[500px]"
          >
            <Dialog.Title className="pl-1 pb-2">Edit item</Dialog.Title>
            <ItemTextArea
              item={item}
              onChange={onContentChange}
              className="min-w-[560px] min-h-[500px]"
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <p className="absolute left-0.5 bottom-0.5 text-xs pointer-events-none tabular-nums">
        {item.id} - word count: {words.length}
      </p>
      <select
        value={item.type}
        onChange={(e) => {
          tabsStore.updateItem(activeTabId, item.id, {
            type: e.target.value as ItemType,
          });
        }}
      >
        <option value="system">System</option>
        <option value="assistant">Assistant</option>
        <option value="user">User</option>
      </select>
      <div className="pt-6 p-1 h-full">
        <ItemTextArea
          item={item}
          onChange={onContentChange}
          className="w-full h-2/3"
        />
      </div>
      <ConnectionPoint item={item} position="top" />
      <ConnectionPoint item={item} position="right" />
      <ConnectionPoint item={item} position="bottom" />
      <ConnectionPoint item={item} position="left" />
      <div className="absolute top-1 right-1 flex items-center gap-1">
        <button
          className="bg-red-200 p-1 rounded-sm text-xs"
          onClick={() => tabsStore.removeItems(activeTabId, [item.id])}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
        {item.type !== "system" && (
          <button
            onClick={handleTraverseClick}
            className="bg-gray-100 hover:bg-gray-300 p-1 rounded-sm text-xs"
          >
            Run till here
          </button>
        )}
        <button
          onClick={() => setDeep(!deep)}
          className="bg-gray-100 hover:bg-gray-300 p-1 rounded-sm text-xs"
        >
          ↗️
        </button>
      </div>
    </div>
  );
}

function ItemTextArea({
  item,
  onChange,
  className,
}: {
  item: CanvasItemType;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) {
  return (
    <Textarea
      // goddamn react moment
      defaultValue={item.content}
      onChange={onChange}
      className={cn("scroll-py-4 scroll-my-4 bg-white resize-none", className)}
    />
  );
}
