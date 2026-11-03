import { Link } from "react-router";
import type { IconComponent } from "@/ui/components/types/icon";
import styles from "./ButtonLink.module.scss";

export function ButtonLink({
  to,
  text,
  Img,
}: {
  to: string;
  text?: string;
  Img?: IconComponent;
}) {
  return (
    <Link to={to} className={styles.button}>
      {Img ? <Img /> : text}
    </Link>
  );
}
