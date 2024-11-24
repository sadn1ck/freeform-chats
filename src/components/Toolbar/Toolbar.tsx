import { Type, Image } from 'lucide-react';

const TOOLBAR_ITEMS = [
  { type: 'text' as const, icon: Type, width: 200, height: 100 },
  { type: 'image' as const, icon: Image, width: 250, height: 150 }
];

export function Toolbar() {
  const handleDragStart = (item: typeof TOOLBAR_ITEMS[0]) => (event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    
    // Create drag preview
    const preview = document.createElement('div');
    preview.style.width = `${item.width}px`;
    preview.style.height = `${item.height}px`;
    preview.style.backgroundColor = '#e0e0e0';
    preview.style.position = 'fixed';
    preview.style.opacity = '0';
    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(preview, 0, 0);
    
    // Clean up preview after drag
    requestAnimationFrame(() => preview.remove());
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        height: '64px',
        backgroundColor: 'white',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '16px',
        padding: '0 24px',
        alignItems: 'center',
        borderRadius: '12px 12px 0 0',
      }}
    >
      {TOOLBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.type}
            draggable
            onDragStart={handleDragStart(item)}
            style={{
              cursor: 'grab',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} />
          </div>
        );
      })}
    </div>
  );
}