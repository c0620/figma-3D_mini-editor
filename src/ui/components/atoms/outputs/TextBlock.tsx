import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./TextBlock.module.scss";
import type { ReactNode } from "react";

export function TextBlock({
  Icon,
  max = false,
  className,
  children,
}: {
  Icon?: IconComponent;
  max?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(styles.textBlock, className && className, {
        [styles.long]: max,
      })}
    >
      {Icon && <Icon />}
      <div className={clsx(styles.textContainer, "t1")}>{children}</div>
    </div>
  );
}
