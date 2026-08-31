import React from "react";

import styles from "./ScrollPanel.module.scss";
import clsx from "clsx";
import type { IconComponent } from "../../types/icon";

export function ScrollPanel({
  fill = false,
  text,
  img: Icon,
  children,
  className,
  disableScroll = true,
  isOpen,
}: {
  fill?: boolean;
  text?: string;
  img?: IconComponent;
  children: React.ReactNode;
  className?: string;
  disableScroll?: boolean;
  isOpen: boolean;
}) {
  return (
    <div
      className={clsx(
        styles.scrollPanelContainer,
        {
          [styles.closed]: !isOpen,
          [styles.fill]: fill,
        },
        className
      )}
    >
      {text && (
        <h3 className={clsx("h3", { [styles.hide]: !isOpen })}>{text}</h3>
      )}
      {Icon && (
        <Icon className={clsx(styles.titleImg, { [styles.hide]: isOpen })} />
      )}

      <div
        className={clsx(styles.scrollPanel, {
          [styles.closed]: !isOpen,
          [styles.disableScroll]: disableScroll,
        })}
      >
        {children}
      </div>
    </div>
  );
}
