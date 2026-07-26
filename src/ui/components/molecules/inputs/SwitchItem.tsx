import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./SwitchItem.module.scss";
import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";

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
  const mode = useContext(PanelSceneModeContext);
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
      {mode == "open" && <div>{text}</div>}
    </div>
  );
}
