import { useDrag } from "@use-gesture/react";
import { tabsStore } from "../../store/tabs";
import type { CanvasItem as CanvasItemType } from "../../types";
import { Textarea } from "../ui/textarea";
import { ConnectionPoint } from "./ConnectionPoint";

interface Props {
  item: CanvasItemType;
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

export function CanvasItem({ item }: Props) {
  const bind = useDrag(
    ({ movement: [x, y], first, memo = { x: item.x, y: item.y } }) => {
      if (first) {
        memo = { x: item.x, y: item.y };
      }

      tabsStore.updateItemInActiveTab(item.id, {
        x: memo.x + x,
        y: memo.y + y,
      });

      return memo;
    }
  );

  const handleTraverseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const paths = tabsStore.findReversePaths(item.id);
    console.log("Reverse paths:");
    paths.forEach((path) => {
      console.log(
        path.nodeIds.reverse().join(" -> "),
        `(depth: ${path.depth})`
      );
    });
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    tabsStore.updateItemInActiveTab(item.id, {
      content: e.target.value,
    });
  };

  return (
    <div
      {...bind()}
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

            tabsStore.addConnection({
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
        backgroundColor: item.type === "text" ? "#f0f0f0" : "#e0e0e0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        userSelect: "none",
        touchAction: "none",
      }}
      className="canvas-item group/canvas-item"
    >
      <span className="absolute left-0 top-0 text-xs">{item.id}</span>
      <div className="pt-6 p-1 h-full">
        <Textarea
          value={item.content}
          onChange={onContentChange}
          className="w-full h-2/3 scroll-py-4 scroll-my-4"
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
