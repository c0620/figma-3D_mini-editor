import { Link } from "react-router";

import styles from "./Button.module.scss";
import clsx from "clsx";
import { useState } from "react";

export interface ButtonProps {
  onClick: () => void;
  text?: string;
  img?: string;
  deactivated?: boolean;
}

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

export function ActionButton({ onClick, text, img }: ButtonProps) {
  return (
    <div className={clsx(styles.actionButton, "h4")} onClick={onClick}>
      {text}
      {img && <img src={img} alt={text} />}
    </div>
  );
}

export function SquareButton({ onClick, text, img, deactivated }: ButtonProps) {
  return (
    <div
      className={clsx(styles.squareButton, { [styles.frozen]: deactivated })}
      onClick={onClick}
    >
      {img && <img src={img} alt={text} />}
    </div>
  );
}

export function SquareStateButton({
  onClick,
  imgs,
  active,
}: {
  onClick: () => void;
  imgs: { active: string; inactive: string };
  active?: boolean;
}) {
  const [isActive, setActive] = useState(active ? active : false);
  const img = isActive ? imgs.active : imgs.inactive;

  const handleClick = () => {
    setActive(!isActive);
    onClick();
  };

  return (
    <div
      className={clsx(styles.squareButton, {
        [styles.active]: active !== undefined ? active : isActive,
      })}
      onClick={handleClick}
    >
      <img src={img} />
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
