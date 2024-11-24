import { Canvas } from "./components/Canvas/Canvas";
import { TabBar } from "./components/TabBar/TabBar";
import { Toolbar } from "./components/Toolbar/Toolbar";

function App() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <TabBar />
      <div className="flex-1 relative w-full h-full">
        <Canvas />
      </div>
      <Toolbar />
    </div>
  );
}

export default App;
