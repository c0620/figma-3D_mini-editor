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
import { useContext, useState } from "react";
import { produce } from "immer";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { useSessionStore } from "@/store/sessionStore";

export function SelectAngleOption({
  title,
  value,
  onClick,
}: {
  title: string;
  value: { azimuth: number; polar: number };
  onClick: (azimuth: number, polar: number) => void;
}) {
  const mode = useContext(PanelSceneModeContext);
  const customAngle = useSessionStore((s) => s.cameraCustomAngle);
  const setCustomAngle = useSessionStore((s) => s.setCameraCustomAngle);
  const options: (Omit<OptionType, "onClick" | "isActive"> & {
    azimuth: number;
    polar: number;
  })[] = [
    { azimuth: 0, polar: 0, text: "Сверху", icon: topIcon },
    { azimuth: 0, polar: Math.PI, text: "Снизу", icon: bottomIcon },
    { azimuth: Math.PI / 2, polar: Math.PI / 2, text: "Слева", icon: leftIcon },
    {
      azimuth: -Math.PI / 2,
      polar: Math.PI / 2,
      text: "Справа",
      icon: rightIcon,
    },
    { azimuth: 0, polar: Math.PI / 2, text: "Спереди", icon: frontIcon },
    { azimuth: Math.PI, polar: Math.PI / 2, text: "Сзади", icon: backIcon },
  ];
  return (
    <div className={styles.container}>
      <h3 className="h3">{title}</h3>
      <div className={styles.optionContainer}>
        {options.map((option) => (
          <Option
            key={option.text}
            icon={mode == "close" ? option.icon : undefined}
            text={option.text}
            onClick={() => onClick(option.azimuth, option.polar)}
            isActive={
              value.azimuth == option.azimuth && value.polar == option.polar
            }
          />
        ))}
        {customAngle && (
          <Option
            key={`customAngle-${customAngle.azimuth}-${customAngle.polar}`}
            icon={mode == "close" ? customIcon : undefined}
            text="Кастомный"
            onClick={() => onClick(customAngle.azimuth, customAngle.polar)}
            isActive={
              value.azimuth == customAngle.azimuth &&
              value.polar == customAngle.polar
            }
          />
        )}
      </div>
      <ActionButton
        onClick={() => {
          setCustomAngle(value.azimuth, value.polar);
        }}
        text={
          customAngle ? "Заменить текущий ракурс" : "Сохранить текущий ракурс"
        }
        img={saveIcon}
        isIconFirst
      />
    </div>
  );
}
