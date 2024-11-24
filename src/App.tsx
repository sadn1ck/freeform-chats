import { useSnapshot } from "valtio";
import { Canvas } from "./components/Canvas/Canvas";
import { TabBar } from "./components/TabBar/TabBar";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { tabsStore } from "./store/tabs";

function App() {
  const { activeTabId } = useSnapshot(tabsStore);
  return (
    <div className="fixed inset-0 flex flex-col">
      <TabBar />
      <div className="flex-1 relative w-full h-full">
        <Canvas key={activeTabId} id={activeTabId} />
      </div>
      <Toolbar />
    </div>
  );
}

export default App;
