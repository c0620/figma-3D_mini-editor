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
}: {
  title: string;
  value: string;
  mode: "open" | "close";
}) {
  const fovPresets: SelectIconVariables = {
    "15mm": {
      id: "15mm",
      icon: fov15Icon,
      title: "Рыбий глаз (15 mm)",
      variable: 180,
    },
    "35mm": {
      id: "35mm",
      icon: fov35Icon,
      title: "Стандарт (35 mm)",
      variable: 63,
    },
    "50mm": {
      id: "50mm",
      icon: fov50Icon,
      title: "Портретный (50 mm)",
      variable: 47,
    },
    "70mm": {
      id: "70mm",
      icon: fov70Icon,
      title: "Узкий (70 mm)",
      variable: 34,
    },
    "400mm": {
      id: "400mm",
      icon: fov400Icon,
      title: "Ультраузкий (400 mm)",
      variable: 6,
    },
  };
  return (
    <div className={styles.commonContainer}>
      {mode == "open" && <p className="t3">{title}</p>}
      <SelectIcon
        variables={fovPresets}
        value={value}
        onChange={(v) => console.log(v)}
      />
    </div>
  );
}
