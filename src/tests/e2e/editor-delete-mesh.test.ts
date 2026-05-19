import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useSceneStore } from "@/store/sceneStore";
import { useSessionStore } from "@/store/sessionStore";

import { createMinimalScene } from "../helpers/minimalScene";
import { renderApp } from "../helpers/renderApp";
import { renderEditorPage } from "../helpers/renderEditor";

function resetStores(): void {
  useSceneStore.setState({ scene: null });
  useSessionStore.setState({
    activeObjectId: null,
    projectName: "",
    notifications: [],
    canUndo: false,
    canRedo: false,
    locale: "ru",
  });
}

describe("e2e (Vitest + Testing Library)", () => {
  beforeEach(() => {
    cleanup();
    resetStores();
  });

  describe("редактор: выбор и удаление меша", () => {
    it("выделяет Cube, удаляет из дерева и ставит visible=false в сторе", async () => {
      const user = userEvent.setup();
      renderEditorPage(createMinimalScene());

      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();

      const meshRow = screen.getByText("Cube");
      expect(meshRow).toHaveStyle({ color: "white" });

      await user.click(meshRow);
      expect(meshRow).toHaveStyle({ color: "orange" });
      expect(useSessionStore.getState().activeObjectId).toBe("mesh-1");

      await user.click(screen.getByRole("button", { name: "D" }));

      expect(screen.queryByText("Cube")).not.toBeInTheDocument();
      expect(screen.getByText(/Камера/)).toBeInTheDocument();

      const obj = useSceneStore.getState().scene!.objects[0];
      expect(obj.pendingDelete).toBe(true);
      expect(obj.visible).toBe(false);
      expect(useSessionStore.getState().canUndo).toBe(true);
    });
  });

  describe("навигация приложения", () => {
    it("старт → загрузка с устройства → редактор (сцена предзагружена)", async () => {
      const user = userEvent.setup();
      renderApp({ preloadScene: true });

      expect(
        screen.getByRole("heading", { name: "3D: мини-редактор" })
      ).toBeInTheDocument();

      const deviceCard = screen
        .getByRole("heading", { name: "Загрузка с устройства" })
        .closest("div")!;
      await user.click(
        within(deviceCard).getByRole("link", { name: "Загрузить" })
      );

      expect(screen.getByText("Загрузка с устройства")).toBeInTheDocument();

      await user.click(
        screen.getByRole("link", { name: "Импортировать модель" })
      );

      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
      expect(screen.getByText("Cube")).toBeInTheDocument();
    });
  });
});
