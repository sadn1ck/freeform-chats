interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export const DEFAULT_ITEM_SIZE: Size = { width: 250, height: 150 };

interface Rect extends Point, Size {}

export const findEmptySpace = (
  items: Array<Rect>,
  newItemSize: Size,
  canvasSize: Size
): Point => {
  const gridSize = 20; // Minimum space between items
  const maxY = canvasSize.height - newItemSize.height;
  const maxX = canvasSize.width - newItemSize.width;

  // Sort items by y position to optimize empty space search
  const sortedItems = items.sort((a, b) => a.y - b.y);
  let lastY = 20;

  // Find gaps between existing items
  for (const item of sortedItems) {
    const gapHeight = item.y - lastY;
    if (gapHeight >= newItemSize.height + gridSize) {
      // Check if we can fit horizontally in this gap
      for (let x = 20; x < maxX; x += gridSize) {
        const testRect = { x, y: lastY, ...newItemSize };
        if (isSpaceEmpty(items, testRect)) {
          return { x, y: lastY };
        }
      }
    }
    lastY = Math.max(lastY, item.y + item.height + gridSize);
  }

  // Check remaining vertical space
  if (lastY + newItemSize.height + gridSize <= maxY) {
    return { x: 20, y: lastY };
  }

  // If no space found, stack at top-right
  return {
    x: canvasSize.width - newItemSize.width - 20,
    y: 20 + items.length * 20,
  };
};

const isSpaceEmpty = (items: Array<Rect>, testRect: Rect): boolean => {
  const padding = 20; // Minimum space between items
  const expandedRect = {
    x: testRect.x - padding,
    y: testRect.y - padding,
    width: testRect.width + padding * 2,
    height: testRect.height + padding * 2,
  };

  return !items.some((item) => rectanglesOverlap(expandedRect, item));
};

const rectanglesOverlap = (rect1: Rect, rect2: Rect): boolean => {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
};
