import { Link } from "react-router";

import styles from "./Button.module.scss";
import clsx from "clsx";
import { useState } from "react";
import type { IconComponent } from "../../types/icon";

export interface ButtonProps {
  onClick: () => void;
  text?: string;
  img?: IconComponent;
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

export function ActionButton({ onClick, text, img: Icon }: ButtonProps) {
  return (
    <div className={clsx(styles.actionButton, "h4")} onClick={onClick}>
      {text}
      {Icon && <Icon title={text} />}
    </div>
  );
}

export function SquareButton({
  onClick,
  text,
  img: Icon,
  deactivated,
}: ButtonProps) {
  return (
    <div
      className={clsx(styles.squareButton, { [styles.frozen]: deactivated })}
      onClick={onClick}
    >
      {Icon && <Icon title={text} />}
    </div>
  );
}

export function SquareStateButton({
  onClick,
  imgs,
  active,
}: {
  onClick: () => void;
  imgs: { active: IconComponent; inactive: IconComponent };
  active?: boolean;
}) {
  const [isActive, setActive] = useState(active ? active : false);
  const Icon = isActive ? imgs.active : imgs.inactive;

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
      <Icon />
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
  img: Icon,
  onClick,
}: {
  text?: string;
  img?: IconComponent;
  onClick: () => void;
}) {
  return (
    <button className={styles.smallButton} onClick={onClick}>
      {text}
      {Icon && <Icon title={text} />}
    </button>
  );
}
