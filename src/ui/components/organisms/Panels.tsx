import { ActionButton } from "../atoms/Button";
import { InputText } from "../atoms/Input";
import { ScrollPanel } from "../atoms/Output";
import { GraphItem } from "../atoms/SceneGraph";
import { PanelModeToggle } from "../atoms/Navigation";
import { createContext, useMemo, useState } from "react";
import {
  useHandlers,
  useSceneEntities,
  type ActiveEntity,
} from "@/app/ApplicationKernelContext";
import { sceneCameraEntityId } from "@/store/sceneEntityList";
import { useSceneStore } from "@/store/sceneStore";

export type PanelMode = "open" | "close";

export const PanelSceneModeContext = createContext<PanelMode>("open");

/** Id строки дерева сцены для текущего выделения (совпадает с GraphItem.item.id). */
function activeEntityRowId(
  active: ActiveEntity | null,
  sceneId: string | null
): string | null {
  if (!active || !sceneId) return null;
  switch (active.kind) {
    case "mesh":
      return active.data.id;
    case "light":
      return active.data.id;
    case "camera":
      return sceneCameraEntityId(sceneId);
  }
}

function activeEntityEditorHeading(active: ActiveEntity): string {
  switch (active.kind) {
    case "mesh":
      return `mesh ${active.data.name}` || "Mesh";
    case "light":
      return active.data.type === "Directional"
        ? "Направленный свет"
        : "Окружающий свет";
    case "camera":
      return active.data.type === "Perspective"
        ? "Камера (перспектива)"
        : "Камера (ортография)";
  }
}

export function PanelScene({ activeObj }: { activeObj: ActiveEntity | null }) {
  const [mode, setMode] = useState<PanelMode>("open");
  const sceneItems = useSceneEntities();
  const sceneId = useSceneStore((s) => s.scene?.id ?? null);
  const { selection } = useHandlers();

  const activeRowId = useMemo(
    () => activeEntityRowId(activeObj, sceneId),
    [activeObj, sceneId]
  );

  return (
    <div
      style={{
        background: "rgba(71, 71, 71, 0.33)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div>
        <PanelModeToggle mode={mode} setMode={setMode} />
        <PanelSceneModeContext.Provider value={mode}>
          <ScrollPanel>
            {sceneItems.map((item) => (
              <GraphItem
                key={item.id}
                item={item}
                isActive={item.id === activeRowId}
                onSelect={() =>
                  item.id === activeRowId
                    ? selection.execute({ id: null })
                    : selection.execute({ id: item.id })
                }
              />
            ))}
          </ScrollPanel>
          <ActionButton
            onClick={() => console.log("add obj")}
            text="Добавить объект"
          />
          <ActionButton
            onClick={() => console.log("add light")}
            text="Добавить свет"
          />

          {activeObj && (
            <div>
              <div>
                Редактирование{" "}
                <strong>{activeEntityEditorHeading(activeObj)}</strong>{" "}
              </div>

              {(activeObj.kind === "mesh" ||
                activeObj.kind === "light" ||
                activeObj.kind === "camera") && (
                <div>
                  <div>Позиция / масштаб (пока заглушки)</div>
                  <InputText />
                  <InputText />
                  <InputText />
                </div>
              )}
            </div>
          )}
        </PanelSceneModeContext.Provider>
      </div>
    </div>
  );
}

export function PanelObject() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      Panel Object
    </div>
  );
}
