import { Link } from "react-router";

import styles from "./Button.module.scss";
import clsx from "clsx";

export function MainButton({
  text,
  action,
  to,
}: {
  text: string;
  action: "nav" | "event";
  to?: string;
}) {
  switch (action) {
    case "event":
      return <div>{text}</div>;
    case "nav":
      return <Link to={to!}>{text}</Link>;
  }
}

export function ActionButton({
  onClick,
  text,
  img,
}: {
  onClick: () => void;
  text?: string;
  img?: string;
}) {
  return (
    <div className={clsx(styles.actionButton, "h4")} onClick={onClick}>
      {text}
      {img && <img src={img} alt={text} />}
    </div>
  );
}

export function NavLinkButton({ to }: { to: string }) {
  return (
    <div>
      <Link to={to}>arrow</Link>
    </div>
  );
}

export function OptionButton() {
  return <div>OptionButton</div>;
}

export function SmallButton({
  text,
  img,
  onClick,
}: {
  text?: string;
  img?: string;
  onClick: () => void;
}) {
  return (
    <button className={styles.smallButton} onClick={onClick}>
      {text}
      {img && <img src={img} />}
    </button>
  );
}
