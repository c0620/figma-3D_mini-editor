import styles from "./Common.module.scss";
import {
  SelectIcon,
  type SelectIconVariables,
} from "../../atoms/inputs/Selects";

import fov15Icon from "@/assets/images/icons/descriptive/fov15.svg?react";
import fov35Icon from "@/assets/images/icons/descriptive/fov35.svg?react";
import fov50Icon from "@/assets/images/icons/descriptive/fov50.svg?react";
import fov70Icon from "@/assets/images/icons/descriptive/fov70.svg?react";
import fov400Icon from "@/assets/images/icons/descriptive/fov400.svg?react";

export function SelectLens({
  title,
  value,
  mode,
  onClick,
}: {
  title: string;
  value: number;
  mode: "open" | "close";
  onClick: (value: number) => void;
}) {
  const fovPresets: SelectIconVariables = {
    120: {
      id: "15mm",
      icon: fov15Icon,
      title: "Рыбий глаз (15 mm)",
      value: 120,
    },
    63: {
      id: "35mm",
      icon: fov35Icon,
      title: "Стандарт (35 mm)",
      value: 63,
    },
    50: {
      id: "50mm",
      icon: fov50Icon,
      title: "Портретный (50 mm)",
      value: 50,
    },
    34: {
      id: "70mm",
      icon: fov70Icon,
      title: "Узкий (70 mm)",
      value: 34,
    },
    6: {
      id: "400mm",
      icon: fov400Icon,
      title: "Ультраузкий (400 mm)",
      value: 6,
    },
  };

  if (!Object.hasOwn(fovPresets, value)) {
    console.warn("SelectLens(SelectLens): unknown value for Lens preset");
    value = fovPresets[50].value;
  }

  return (
    <div className={styles.commonContainer}>
      {mode == "open" && <p className="t3">{title}</p>}
      <SelectIcon
        variables={fovPresets}
        value={value}
        onChange={(v) => onClick(v)}
        isOpen={mode == "open"}
      />
    </div>
  );
}
