import { Routes, Route, MemoryRouter } from "react-router";
import StartScreen from "./ui/components/screens/StartScreen";
import EditorPage from "./ui/components/screens/EditorPageScreen";
import AssetLibraryScreen from "./ui/components/screens/AssetLibraryScreen";
import LoadSceneScreen from "./ui/components/screens/LoadSceneScreen";

function App() {
  return (
    <>
      <MemoryRouter>
        <Routes>
          <Route index element={<StartScreen />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="library" element={<AssetLibraryScreen />} />
          <Route path="load">
            <Route path="local" element={<LoadSceneScreen type="local" />} />
            <Route path="figma" element={<LoadSceneScreen type="figma" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </>
  );
}

export default App;
