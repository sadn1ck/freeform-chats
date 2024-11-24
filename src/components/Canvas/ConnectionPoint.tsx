import { CSSProperties } from "react";
import type { CanvasItem } from "../../types";

interface Props {
  item: CanvasItem;
  position: "top" | "right" | "bottom" | "left";
}

export function ConnectionPoint({ item, position }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      "connection",
      JSON.stringify({
        sourceId: item.id,
        position,
      })
    );
  };

  const getStyle = (): CSSProperties => {
    const base: CSSProperties = {
      position: "absolute",
      width: "16px",
      height: "16px",
      backgroundColor: "#fff",
      border: "2px solid #666",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: 10,
    };

    const positions: Record<
      "top" | "right" | "bottom" | "left",
      CSSProperties
    > = {
      top: { top: "-8px", left: "50%", transform: "translateX(-50%)" },
      right: { top: "50%", right: "-8px", transform: "translateY(-50%)" },
      bottom: { bottom: "-8px", left: "50%", transform: "translateX(-50%)" },
      left: { top: "50%", left: "-8px", transform: "translateY(-50%)" },
    };

    return { ...base, ...positions[position] };
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      data-connection-point
      data-item-id={item.id}
      data-position={position}
      style={getStyle()}
      className="opacity-0 group-hover/canvas-item:opacity-100"
    />
  );
}
