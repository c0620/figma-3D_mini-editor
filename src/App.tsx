import { Routes, Route, MemoryRouter } from "react-router";
import StartScreen from "./ui/components/screens/StartScreen";
import EditorPage from "./ui/components/screens/EditorPageScreen";
import AssetLibraryScreen from "./ui/components/screens/AssetLibraryScreen";
import { useEffect } from "react";
import { useSessionStore } from "./store/sessionStore";
import { LoadScreen } from "./ui/components/screens/LoadScreen";

function App() {
  const colorTheme = useSessionStore((s) => s.colorTheme);
  const windowSize = useSessionStore((s) => s.windowSize);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
    document.documentElement.setAttribute("data-window-size", windowSize);
  }, [colorTheme, windowSize]);

  return (
    <>
      <MemoryRouter>
        <Routes>
          <Route index element={<StartScreen />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="library" element={<AssetLibraryScreen />} />
          <Route path="load">
            <Route path="local" element={<LoadScreen type="Local" />} />
            <Route path="figma" element={<LoadScreen type="Figma" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </>
  );
}

export default App;
