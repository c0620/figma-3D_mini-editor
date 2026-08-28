import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./Radio.module.scss";

export type RadioProps = {
  icon?: IconComponent;
  text: string;
  isActive: boolean;
  onClick: () => void;
};

export function Radio({
  icon: Icon,
  text,
  onClick,
  isActive,
  isLong = true,
}: RadioProps & { isLong?: boolean }) {
  return (
    <div
      className={clsx("t3", styles.option, {
        [styles.optionActive]: isActive,
        accent: isActive,
      })}
      onClick={onClick}
    >
      {Icon && <Icon />}
      {isLong && text}
    </div>
  );
}
