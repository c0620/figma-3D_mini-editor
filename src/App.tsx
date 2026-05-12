import { Routes, Route, MemoryRouter } from "react-router";
import StartScreen from "./ui/components/screens/StartScreen";
import EditorPage from "./ui/components/screens/EditorPageScreen";
import AssetLibraryScreen from "./ui/components/screens/AssetLibraryScreen";
import LoadLocalSceneScreen from "./ui/components/screens/LoadLocalSceneScreen";
import LoadFigmaSceneScreen from "./ui/components/screens/LoadFigmaSceneScreen";

function App() {
  return (
    <>
      <MemoryRouter>
        <Routes>
          <Route index element={<StartScreen />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="library" element={<AssetLibraryScreen />} />
          <Route path="load">
            <Route path="local" element={<LoadLocalSceneScreen />} />
            <Route
              path="figma"
              element={<LoadFigmaSceneScreen type="figma" />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </>
  );
}

export default App;
