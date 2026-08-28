import { useContext } from "react";
import { Radio, type RadioProps } from "../../../atoms/inputs/Radio";
import { PanelSceneModeContext } from "../../../templates/panels/BasePanel";
import styles from "./RadioCommon.module.scss";
import type { SceneLight } from "@/types/scene";
import type { LightPatch } from "@/store/sceneStore";
import softLight from "@/assets/images/icons/descriptive/softLight.svg?react";
import hardLight from "@/assets/images/icons/descriptive/hardLight.svg?react";
import areaLight from "@/assets/images/icons/descriptive/areaLight.svg?react";

export function RadioLightPresets({
  value,
  title,
  onClick,
}: {
  value: Pick<SceneLight, "angle" | "decay" | "distance" | "penumbra">;
  title: string;
  onClick: (value: LightPatch) => void;
}) {
  const mode = useContext(PanelSceneModeContext);
  const options: (Omit<RadioProps, "onClick" | "isActive"> &
    Pick<SceneLight, "angle" | "decay" | "distance" | "penumbra">)[] = [
    {
      text: "Мягкое",
      angle: Math.PI / 3,
      penumbra: 0.85,
      decay: 2,
      distance: 0,
      icon: softLight,
    },
    {
      text: "Жёсткое",
      angle: Math.PI / 6,
      penumbra: 0,
      decay: 2,
      distance: 0,
      icon: hardLight,
    },
    {
      text: "По площади",
      angle: Math.PI / 2,
      penumbra: 1,
      decay: 0,
      distance: 0,
      icon: areaLight,
    },
  ];
  return (
    <div className={styles.container}>
      {mode == "open" && <h3 className="h3">{title}</h3>}
      <div className={styles.optionContainer}>
        {options.map((option) => (
          <Radio
            key={option.text}
            icon={mode == "close" ? option.icon : undefined}
            text={option.text}
            onClick={() =>
              onClick({
                angle: option.angle,
                penumbra: option.penumbra,
                decay: option.decay,
                distance: option.distance,
              })
            }
            isActive={
              value.angle == option.angle &&
              value.penumbra == option.penumbra &&
              value.decay == option.decay &&
              value.distance == option.distance
            }
            isLong={mode == "open"}
          />
        ))}
      </div>
    </div>
  );
}
