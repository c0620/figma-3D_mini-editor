import clsx from "clsx";
import styles from "./Tag.module.scss";

export function Tag({ text }: { text: string }) {
  return <div className={clsx("t3", styles.tag)}>{text}</div>;
}
