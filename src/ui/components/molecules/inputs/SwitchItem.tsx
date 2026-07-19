import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./SwitchItem.module.scss";

export function SwitchItem({
  icon: Icon,
  text,
  onClick,
  isActive,
}: {
  icon: IconComponent;
  text: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={clsx("t3", styles.selectItem, {
        [styles.itemActive]: isActive,
      })}
      onClick={onClick}
    >
      <div className={styles.itemIcon}>
        <Icon />
      </div>
      <div>{text}</div>
    </div>
  );
}
