import { Routes, Route, MemoryRouter } from "react-router";
import StartScreen from "./ui/components/screens/start/StartScreen";
import EditorPage from "./ui/components/screens/EditorPageScreen";
import AssetLibraryScreen from "./ui/components/screens/AssetLibraryScreen";
import { useEffect, useState } from "react";
import { useSessionStore } from "./store/sessionStore";
import { ImportScreen } from "./ui/components/screens/ImportScreen";
import { Alert } from "./ui/components/templates/alert/Alert";
import { ExportModal } from "./ui/components/templates/modal/export/ExportModal";

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
            <Route path="local" element={<ImportScreen type="Local" />} />
            <Route path="figma" element={<ImportScreen type="Figma" />} />
          </Route>
        </Routes>
      </MemoryRouter>
      <Alert />
    </>
  );
}

export default App;
