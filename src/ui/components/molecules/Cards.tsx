import { NavLink } from "react-router";
import styles from "./Cards.module.css";
import next from "@/assets/images/icons/descriptive/arrowR.svg";

export function CardStart({
  title,
  text,
  image,
  to,
}: {
  title: string;
  text: string;
  image: string;
  to: string;
}) {
  return (
    <div className={"panel-container " + styles.card}>
      <div className={styles.text}>
        <h2>{title}</h2>
        <div className={"t1 " + styles.t1}>{text}</div>
      </div>

      <img className={styles.models} src={image}></img>
      <NavLink className={styles.button} to={to}>
        <img src={next} />
      </NavLink>
    </div>
  );
}

export function CardAsset() {}
