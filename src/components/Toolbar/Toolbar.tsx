import { Type } from "lucide-react";
import { DEFAULT_ITEM_SIZE } from "../../utils/canvasLayout";

const DEFAULT_TOOLBAR_INSERT_OPTIONS = [
  { type: "system", icon: Type, ...DEFAULT_ITEM_SIZE },
];

export function Toolbar() {
  const handleDragStart =
    (item: (typeof DEFAULT_TOOLBAR_INSERT_OPTIONS)[0]) =>
    (event: React.DragEvent) => {
      event.dataTransfer.setData("toolbar-item-dnd", JSON.stringify(item));
    };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        height: "64px",
        backgroundColor: "white",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "16px",
        padding: "0 24px",
        alignItems: "center",
        borderRadius: "12px 12px 0 0",
      }}
    >
      {DEFAULT_TOOLBAR_INSERT_OPTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.type}
            draggable
            onDragStart={handleDragStart(item)}
            style={{
              cursor: "grab",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} />
          </div>
        );
      })}
    </div>
  );
}
