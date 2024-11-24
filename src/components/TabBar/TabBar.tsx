import { Plus, X } from "lucide-react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";

export function TabBar() {
  const { tabsList, activeTabId } = useSnapshot(tabsStore);

  return (
    <div
      style={{
        height: "40px",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "8px",
        borderBottom: "1px solid #ddd",
      }}
    >
      {tabsList.map((tab) => (
        <div
          key={tab.id}
          onClick={() => tabsStore.setActiveTab(tab.id)}
          style={{
            padding: "4px 12px",
            backgroundColor: tab.id === activeTabId ? "#fff" : "transparent",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            userSelect: "none",
          }}
        >
          <span>{tab.id}</span>
          {tabsList.length > 1 && (
            <X
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                tabsStore.removeTab(tab.id);
              }}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      ))}
      <button
        onClick={() => tabsStore.addTab()}
        style={{
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          borderRadius: "4px",
        }}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
