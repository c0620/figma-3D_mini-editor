import { Option, type OptionType } from "../../atoms/inputs/Selects";
import styles from "./SelectAngleOption.module.scss";

import backIcon from "@/assets/images/icons/descriptive/cameraPBack.svg?react";
import bottomIcon from "@/assets/images/icons/descriptive/cameraPBot.svg?react";
import frontIcon from "@/assets/images/icons/descriptive/cameraPFront.svg?react";
import leftIcon from "@/assets/images/icons/descriptive/cameraPLeft.svg?react";
import rightIcon from "@/assets/images/icons/descriptive/cameraPRight.svg?react";
import topIcon from "@/assets/images/icons/descriptive/cameraPTop.svg?react";
import saveIcon from "@/assets/images/icons/descriptive/cameraPSave.svg?react";
import { ActionButton } from "../../atoms/buttons/Button";

export function SelectAngleOption({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number[];
  onClick: (value: number[]) => void;
}) {
  const options: Omit<OptionType, "onClick" | "isActive">[] = [
    { value: [0, 0, 0], text: "Верх", icon: topIcon },
    { value: [0, 0, 1], text: "Низ", icon: bottomIcon },
    { value: [1, 0, 1], text: "Лево", icon: leftIcon },
    { value: [0, 0, 1], text: "Право", icon: rightIcon },
    { value: [0, 1, 1], text: "Спереди", icon: frontIcon },
    { value: [1, 1, 1], text: "Сзади", icon: backIcon },
  ];
  return (
    <div className={styles.container}>
      <h3 className="h3">{title}</h3>
      <div className={styles.optionContainer}>
        {options.map((option) => (
          <Option
            key={option.text}
            icon={option.icon}
            text={option.text}
            onClick={() => onClick(option.value)}
            isActive={JSON.stringify(value) === JSON.stringify(option.value)}
          />
        ))}
      </div>
      <ActionButton
        onClick={() => console.log("save camera angle")}
        text="Сохранить текущий ракурс"
        img={saveIcon}
        isIconFirst
      />
    </div>
  );
}
