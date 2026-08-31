import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./SwitchItem.module.scss";

export function SwitchItem({
  icon: Icon,
  text,
  onClick,
  isActive,
  isOpen,
}: {
  icon: IconComponent;
  text: string;
  onClick: () => void;
  isActive: boolean;
  isOpen: boolean;
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
      {isOpen && <div>{text}</div>}
    </div>
  );
}
