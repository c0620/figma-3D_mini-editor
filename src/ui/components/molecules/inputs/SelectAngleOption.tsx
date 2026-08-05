import { Option, type OptionType } from "../../atoms/inputs/Selects";
import styles from "./SelectAngleOption.module.scss";

import backIcon from "@/assets/images/icons/descriptive/cameraPBack.svg?react";
import bottomIcon from "@/assets/images/icons/descriptive/cameraPBot.svg?react";
import frontIcon from "@/assets/images/icons/descriptive/cameraPFront.svg?react";
import leftIcon from "@/assets/images/icons/descriptive/cameraPLeft.svg?react";
import rightIcon from "@/assets/images/icons/descriptive/cameraPRight.svg?react";
import topIcon from "@/assets/images/icons/descriptive/cameraPTop.svg?react";
import customIcon from "@/assets/images/icons/descriptive/cameraPUser.svg?react";
import saveIcon from "@/assets/images/icons/descriptive/cameraPSave.svg?react";
import { ActionButton } from "../../atoms/buttons/Button";
import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { useSessionStore } from "@/store/sessionStore";
import type { SceneCamera } from "@/types/scene";

export function SelectAngleOption({
  title,
  value,
  onClick,
}: {
  title: string;
  value: Pick<SceneCamera, "azimuth" | "polar" | "target">;
  onClick: (value: Pick<SceneCamera, "azimuth" | "polar" | "target">) => void;
}) {
  const mode = useContext(PanelSceneModeContext);
  const customAngle = useSessionStore((s) => s.cameraCustomAngle);
  const setCustomAngle = useSessionStore((s) => s.setCameraCustomAngle);
  const options: (Omit<OptionType, "onClick" | "isActive"> &
    Pick<SceneCamera, "azimuth" | "polar" | "target">)[] = [
    { azimuth: 0, polar: 0, text: "Сверху", icon: topIcon, target: [0, 0, 0] },
    {
      azimuth: 0,
      polar: Math.PI,
      text: "Снизу",
      icon: bottomIcon,
      target: [0, 0, 0],
    },
    {
      azimuth: Math.PI / 2,
      polar: Math.PI / 2,
      text: "Слева",
      icon: leftIcon,
      target: [0, 0, 0],
    },
    {
      azimuth: -Math.PI / 2,
      polar: Math.PI / 2,
      text: "Справа",
      icon: rightIcon,
      target: [0, 0, 0],
    },
    {
      azimuth: 0,
      polar: Math.PI / 2,
      text: "Спереди",
      icon: frontIcon,
      target: [0, 0, 0],
    },
    {
      azimuth: Math.PI,
      polar: Math.PI / 2,
      text: "Сзади",
      icon: backIcon,
      target: [0, 0, 0],
    },
  ];
  return (
    <div className={styles.container}>
      {mode == "open" && <h3 className="h3">{title}</h3>}
      <div className={styles.optionContainer}>
        {options.map((option) => (
          <Option
            key={option.text}
            icon={mode == "close" ? option.icon : undefined}
            text={option.text}
            onClick={() =>
              onClick({
                azimuth: option.azimuth,
                polar: option.polar,
                target: option.target,
              })
            }
            isActive={
              value.azimuth == option.azimuth && value.polar == option.polar
            }
            isLong={mode == "open"}
          />
        ))}
        {customAngle && (
          <Option
            key={`customAngle-${customAngle.azimuth}-${customAngle.polar}`}
            icon={mode == "close" ? customIcon : undefined}
            text="Кастомный"
            onClick={() =>
              onClick({
                azimuth: customAngle.azimuth,
                polar: customAngle.polar,
                target: customAngle.target,
              })
            }
            isActive={
              value.azimuth == customAngle.azimuth &&
              value.polar == customAngle.polar &&
              value.target[0] == customAngle.target[0] &&
              value.target[1] == customAngle.target[1] &&
              value.target[2] == customAngle.target[2]
            }
            isLong={mode == "open"}
          />
        )}
      </div>
      <ActionButton
        onClick={() => {
          setCustomAngle({
            azimuth: value.azimuth,
            polar: value.polar,
            target: value.target,
          });
        }}
        text={
          mode == "close"
            ? undefined
            : customAngle
              ? "Заменить текущий ракурс"
              : "Сохранить текущий ракурс"
        }
        img={mode == "close" ? saveIcon : undefined}
        isIconFirst
      />
    </div>
  );
}
