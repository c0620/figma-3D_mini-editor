import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import { AppKernelProvider } from "@/app/ApplicationKernelContext";
import { buildKernel } from "@/app/compositionRoot";
import { SceneStorage } from "@/store/sceneStorage";
import type { Scene } from "@/types/scene";
import EditorPage from "@/ui/components/screens/EditorPageScreen";

import { createMinimalScene } from "./minimalScene";

export function loadSceneIntoStore(scene: Scene = createMinimalScene()): void {
  const storage = new SceneStorage();
  storage.load(scene);
}

/** Монтирует экран редактора с ядром и предзагруженной сценой (без полного App-роутера). */
export function renderEditorPage(scene?: Scene) {
  const kernel = buildKernel();
  loadSceneIntoStore(scene ?? createMinimalScene());

  return {
    kernel,
    ...render(
      <AppKernelProvider kernel={kernel}>
        <MemoryRouter initialEntries={["/editor"]}>
          <Routes>
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </MemoryRouter>
      </AppKernelProvider>,
    ),
  };
}
