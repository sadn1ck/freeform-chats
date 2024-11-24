import { useSnapshot } from 'valtio';
import { useDrag } from '@use-gesture/react';
import type { CanvasItem as CanvasItemType } from '../../types';
import { tabsStore } from '../../store/tabs';

interface Props {
  item: CanvasItemType;
}

export function CanvasItem({ item }: Props) {
  const bind = useDrag(({ movement: [x, y], first, memo = { x: item.x, y: item.y } }) => {
    if (first) {
      memo = { x: item.x, y: item.y };
    }
    
    tabsStore.updateItemInActiveTab(item.id, {
      x: memo.x + x,
      y: memo.y + y
    });
    
    return memo;
  });

  return (
    <div
      {...bind()}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${item.x}px, ${item.y}px)`,
        width: item.width,
        height: item.height,
        cursor: 'move',
        backgroundColor: item.type === 'text' ? '#f0f0f0' : '#e0e0e0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {item.type === 'text' ? 'Text Block' : 'Image Placeholder'}
    </div>
  );
}