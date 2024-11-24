import { getBoxToBoxArrow } from "perfect-arrows";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";

export function Arrows() {
  const { activeTabId, stores } = useSnapshot(tabsStore);
  const store = stores[activeTabId];

  if (!store) return null;

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
      {store.connections.map((connection) => {
        const sourceItem = store.items.find(
          (item) => item.id === connection.sourceId
        );
        const targetItem = store.items.find(
          (item) => item.id === connection.targetId
        );

        if (!sourceItem || !targetItem) return null;

        // const getPointCoordinates = (
        //   item: typeof sourceItem,
        //   position: string
        // ) => {
        //   switch (position) {
        //     case "top":
        //       return [item.x + item.width / 2, item.y];
        //     case "right":
        //       return [item.x + item.width, item.y + item.height / 2];
        //     case "bottom":
        //       return [item.x + item.width / 2, item.y + item.height];
        //     case "left":
        //       return [item.x, item.y + item.height / 2];
        //     default:
        //       return [0, 0];
        //   }
        // };

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

        // const [x1, y1] = getPointCoordinates(
        //   sourceItem,
        //   connection.sourcePosition
        // );
        // const [x2, y2] = getPointCoordinates(
        //   targetItem,
        //   connection.targetPosition
        // );

        // const [sx, sy, cx, cy, ex, ey, ae, as, ec] = getArrow(x1, y1, x2, y2, {
        //   padStart: 6,
        //   padEnd: 6,
        // });

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
              tabsStore.getActiveStore()?.removeConnection(connection.id);
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
