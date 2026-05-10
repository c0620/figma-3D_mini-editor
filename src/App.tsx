import { useState } from "react";
import { postMessageToBackend } from "./lib/helpers";

function App() {
  const [count, setCount] = useState(5);
  const createRect = () => {
    postMessageToBackend("create-rectangles", { count: count });
  };

  const onCancel = () => {
    postMessageToBackend("cancel");
  };

  return (
    <>
      <div className="panel">
        <h1 className="panel-title">🚀 Figma Plugin Starter</h1>
        <p className="panel-desc">
          Use this panel to interact with your plugin. Update controls as needed.
        </p>

        <input
          id="count"
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="input"
        />

        <button onClick={createRect} className="button button-blue">
          Create Rectangle
        </button>

        <button onClick={onCancel} className="button button-red">
          Cancel
        </button>
      </div>
    </>
  );
}

export default App;
