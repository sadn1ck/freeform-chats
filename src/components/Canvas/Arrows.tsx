import { getBoxToBoxArrow } from "perfect-arrows";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";

export function Arrows() {
  const { activeTabId, stores } = useSnapshot(tabsStore);
  const canvas = stores[activeTabId];

  if (!canvas) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {canvas.connections.map((connection) => {
        const sourceItem = canvas.items.find(
          (item) => item.id === connection.sourceId
        );
        const targetItem = canvas.items.find(
          (item) => item.id === connection.targetId
        );

        if (!sourceItem || !targetItem) return null;

        const argsForBoxToBox = (
          source: typeof sourceItem,
          target: typeof targetItem
        ) => {
          return [
            source.x,
            source.y,
            source.width,
            source.height,
            target.x,
            target.y,
            target.width,
            target.height,
          ];
        };

        const args = argsForBoxToBox(sourceItem, targetItem);
        const [x0, y0, x1, y1, x2, y2, x3, y3] = args;
        const [sx, sy, cx, cy, ex, ey, ae, as, ec] = getBoxToBoxArrow(
          x0,
          y0,
          x1,
          y1,
          x2,
          y2,
          x3,
          y3,
          {
            bow: 0,
            stretch: 0.5,
            stretchMin: 0,
            stretchMax: 420,
            padStart: 0,
            padEnd: 0,
            flip: false,
            straights: true,
          }
        );

        const endAngleAsDegrees = ae * (180 / Math.PI);

        return (
          <path
            d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
            fill="none"
            key={connection.id}
            stroke="#666"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
            className="pointer-events-auto"
            onDoubleClick={() => {
              tabsStore.removeConnection(activeTabId, connection.id);
            }}
          />
        );
      })}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
        </marker>
      </defs>
    </svg>
  );
}
