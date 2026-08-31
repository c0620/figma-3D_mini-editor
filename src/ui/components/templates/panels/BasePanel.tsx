import styles from "./Panel.module.scss";
import { PanelModeToggle } from "../../atoms/buttons/Navigation";
import clsx from "clsx";

export function Panel({
  panel,
  text,
  children,
  isOpen,
  onToggle,
}: {
  panel: "Left" | "Right";
  text: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx(styles.panel, {
        [styles.close]: !isOpen,
      })}
    >
      <PanelModeToggle
        isOpen={isOpen}
        onToggle={onToggle}
        panel={panel}
        text={text}
      />
      <div className={styles.panelContent}>{children}</div>
    </div>
  );
}
