import { Radio, type RadioProps } from "../../../atoms/inputs/Radio";
import styles from "./RadioCommon.module.scss";

import backIcon from "@/assets/images/icons/descriptive/cameraPBack.svg?react";
import bottomIcon from "@/assets/images/icons/descriptive/cameraPBot.svg?react";
import frontIcon from "@/assets/images/icons/descriptive/cameraPFront.svg?react";
import leftIcon from "@/assets/images/icons/descriptive/cameraPLeft.svg?react";
import rightIcon from "@/assets/images/icons/descriptive/cameraPRight.svg?react";
import topIcon from "@/assets/images/icons/descriptive/cameraPTop.svg?react";
import customIcon from "@/assets/images/icons/descriptive/cameraPUser.svg?react";
import saveIcon from "@/assets/images/icons/descriptive/cameraPSave.svg?react";
import { ActionButton } from "../../../atoms/buttons/Button";
import { useSessionStore } from "@/store/sessionStore";
import type { SceneCamera } from "@/types/scene";

export function RadioCameraAnglePresets({
  title,
  value,
  onClick,
  isOpen,
}: {
  title: string;
  value: Pick<SceneCamera, "azimuth" | "polar" | "target">;
  onClick: (value: Pick<SceneCamera, "azimuth" | "polar" | "target">) => void;
  isOpen: boolean;
}) {
  const customAngle = useSessionStore((s) => s.cameraCustomAngle);
  const setCustomAngle = useSessionStore((s) => s.setCameraCustomAngle);
  const options: (Omit<RadioProps, "onClick" | "isActive"> &
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
      {isOpen && <h3 className="h3">{title}</h3>}
      <div className={styles.optionContainer}>
        {options.map((option) => (
          <Radio
            key={option.text}
            icon={!isOpen ? option.icon : undefined}
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
            isLong={isOpen}
          />
        ))}
        {customAngle && (
          <Radio
            key={`customAngle-${customAngle.azimuth}-${customAngle.polar}`}
            icon={!isOpen ? customIcon : undefined}
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
            isLong={isOpen}
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
          !isOpen
            ? undefined
            : customAngle
              ? "Заменить текущий ракурс"
              : "Сохранить текущий ракурс"
        }
        img={!isOpen ? saveIcon : undefined}
        isIconFirst
      />
    </div>
  );
}
