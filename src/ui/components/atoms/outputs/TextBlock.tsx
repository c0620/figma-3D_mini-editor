import clsx from "clsx";
import type { IconComponent } from "../../types/icon";
import styles from "./TextBlock.module.scss";

export function TextBlock({
  text,
  Icon,
  textListItems,
}: {
  text: string;
  Icon: IconComponent;
  textListItems?: Array<string>;
}) {
  return (
    <div className={styles.textBlock}>
      {Icon && <Icon />}
      <div className={clsx(styles.textContainer, "t1")}>
        {text} {textListItems && textListItems.map((item) => <p>{item}</p>)}
      </div>
    </div>
  );
}
