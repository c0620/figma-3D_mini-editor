import type { MouseEvent } from "react";
import { useHandlers } from "@/app/ApplicationKernelContext";
import type {
  SceneEntityKind,
  SceneEntitySummary,
} from "@/store/sceneEntityList";

export function GraphItem({
  item,
  isActive,
  onSelect,
}: {
  item: SceneEntitySummary;
  isActive: boolean;
  onSelect: () => void;
}) {
  const changeVisibilityHandler = useHandlers().visibility;
  const changeLockHandler = useHandlers().lock;
  const deleteHandler = useHandlers().deletion;

  const stopClick = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      style={
        isActive
          ? {
              color: "orange",
              display: "flex",
              gap: "20px",
            }
          : { color: "white", display: "flex", gap: "20px" }
      }
      onClick={onSelect}
    >
      <img alt="icon" />
      {item.label}
      {(isActive || item.locked || !item.visible) && (
        <div>
          <button
            onClick={(e) => {
              stopClick(e);
              changeLockHandler.execute({ id: item.id, type: item.kind });
            }}
          >
            {item.locked ? "F" : "L"}
          </button>{" "}
          {item.kind !== "camera" && (
            <>
              <button
                onClick={(e) => {
                  stopClick(e);
                  changeVisibilityHandler.execute({
                    id: item.id,
                    type: item.kind as Exclude<SceneEntityKind, "camera">,
                  });
                }}
              >
                {item.visible ? "H" : "S"}
              </button>
              <button
                onClick={(e) => {
                  stopClick(e);
                  deleteHandler.execute({
                    modelId: item.id,
                    type: item.kind as Exclude<SceneEntityKind, "camera">,
                  });
                }}
              >
                D
              </button>{" "}
            </>
          )}
        </div>
      )}
    </div>
  );
}
