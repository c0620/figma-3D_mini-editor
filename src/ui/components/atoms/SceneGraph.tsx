import { useHandlers } from "@/app/ApplicationKernelContext";
import type { SceneEntitySummary } from "@/store/sceneEntityList";

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
      {isActive && (
        <div>
          {" "}
          <button
            onClick={() => changeVisibilityHandler.execute({ id: item.id })}
          >
            {item.visible ? "H" : "S"}
          </button>
          <button onClick={() => changeLockHandler.execute({ id: item.id })}>
            {item.locked ? "F" : "L"}
          </button>{" "}
          <button onClick={() => deleteHandler.execute({ modelId: item.id })}>
            D
          </button>{" "}
        </div>
      )}
    </div>
  );
}
