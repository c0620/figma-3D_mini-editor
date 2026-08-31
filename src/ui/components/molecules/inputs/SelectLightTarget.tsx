import { useSceneStore } from "@/store/sceneStore";
import {
  SelectVariable,
  type SelectVariables,
} from "../../atoms/inputs/Selects";
import styles from "./Common.module.scss";

function useLightTargetOptions(activeTargetId: string | null) {
  const meshes = useSceneStore((s) => s.scene?.meshes);
  const groups = useSceneStore((s) => s.scene?.groups);

  const targetVariables: SelectVariables<string> = {
    "": {
      id: "",
      title: "По оси объекта",
      value: "",
    },
  };

  addTargetOptions(targetVariables, meshes, activeTargetId);
  addTargetOptions(targetVariables, groups, activeTargetId);

  return targetVariables;
}

function addTargetOptions(
  targetVariables: SelectVariables<string>,
  items:
    | Record<string, { id: string; name: string; pendingDelete: boolean }>
    | undefined,
  activeTargetId: string | null
) {
  if (!items) return;
  for (const item of Object.values(items)) {
    if (item.pendingDelete && item.id !== activeTargetId) continue;
    targetVariables[item.id] = {
      id: item.id,
      title: item.name,
      value: item.id,
    };
  }
}

export function SelectLightTarget({
  isOpen,
  title,
  target,
  onClick,
}: {
  title: string;
  target: string | null;
  isOpen: boolean;
  onClick: (value: string | null) => void;
}) {
  const targetVariables = useLightTargetOptions(target);
  return (
    <div className={styles.commonContainer}>
      {isOpen && <p className="t3">{title}</p>}
      <SelectVariable
        variables={targetVariables}
        value={target ?? ""}
        onChange={(value) => onClick(value != "" ? value : null)}
        isOpen={isOpen}
      />
    </div>
  );
}
