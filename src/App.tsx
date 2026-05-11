import { Routes, Route, MemoryRouter } from "react-router";
import StartScreen from "./ui/components/screens/StartScreen";
import EditorPage from "./ui/components/screens/EditorPageScreen";

function App() {
  return (
    <>
      <MemoryRouter>
        <Routes>
          <Route index path="/" element={<StartScreen />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </MemoryRouter>
    </>
  );
}

export default App;
