import { useDrag } from "@use-gesture/react";
import { useSnapshot } from "valtio";
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
  const writeStore = stores[activeTabId];

  const bind = useDrag(
    ({ movement: [x, y], first, memo = { x: item.x, y: item.y } }) => {
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
    }
  );

  const handleTraverseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const paths = tabsStore.findReversePaths(item.id);
    if (!writeStore) return;

    paths.forEach((path) => {
      const partialPrompt: { type: ItemType; content: string }[] = [];
      const nodeIds = [...path.nodeIds].reverse();

      nodeIds.forEach((nodeId) => {
        const node = writeStore.items.find((item) => item.id === nodeId);
        partialPrompt.push({
          type: node?.type ?? "user",
          content: node?.content ?? "",
        });
      });

      const lastNode = writeStore.items.find(
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
      {...bind()}
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
      className="canvas-item group/canvas-item"
    >
      <pre className="absolute left-0 bottom-0 text-xs">
        {item.id} - word count: {words.length}
      </pre>
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
        <Textarea
          value={item.content}
          onChange={onContentChange}
          className="w-full h-2/3 scroll-py-4 scroll-my-4 bg-white"
        />
      </div>
      <ConnectionPoint item={item} position="top" />
      <ConnectionPoint item={item} position="right" />
      <ConnectionPoint item={item} position="bottom" />
      <ConnectionPoint item={item} position="left" />
      <button
        onClick={handleTraverseClick}
        className="absolute top-0 right-0 p-1 text-xs border-border border-gray-400 text-white rounded w-5 h-5 inline-flex items-center justify-center"
        style={{ fontSize: "10px" }}
      >
        🔍
      </button>
    </div>
  );
}
