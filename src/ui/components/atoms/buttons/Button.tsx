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
  isIconFirst?: boolean;
}

export function MainButton({
  text,
  to,
  onClick,
  frozen,
}: {
  text: string;
  to?: string | null;
  onClick?: () => void;
  frozen: boolean;
}) {
  return (
    <>
      {to ? (
        <Link to={to!} className={clsx("h2", styles.mainButton)}>
          {text}
        </Link>
      ) : (
        <div
          className={clsx("h2", styles.mainButton, { [styles.frozen]: frozen })}
          onClick={onClick ?? undefined}
        >
          {text}
        </div>
      )}
    </>
  );
}

export function ActionButton({
  onClick,
  text,
  img: Icon,
  isIconFirst,
  deactivated = false,
}: ButtonProps) {
  return (
    <div
      className={clsx(styles.actionButton, "h4", {
        [styles.frozen]: deactivated,
      })}
      onClick={onClick}
    >
      {Icon && isIconFirst && <Icon title={text} />}
      {text}
      {Icon && !isIconFirst && <Icon title={text} />}
    </div>
  );
}

export function ChoiceButton({
  text,
  img: Icon,
  choices,
  isLong,
}: Omit<ButtonProps, "onClick"> & {
  choices: { name: string; Icon: IconComponent; onClick: () => void }[];
  isLong: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={clsx(styles.choiceButtonContainer)}
      onPointerOver={() => setIsOpen(true)}
      onPointerLeave={() => setIsOpen(false)}
    >
      <div
        className={clsx(styles.choiceButton, "h4", {
          [styles.choiceButtonShort]: !isLong,
        })}
      >
        {text}
        {Icon && <Icon title={text} />}
      </div>
      {isOpen && (
        <div className={styles.choiceOptionsContainer}>
          <div className={styles.choiceOptions}>
            {choices.map((c) => (
              <div
                className={clsx("h4", styles.choiceOption)}
                onClick={c.onClick}
              >
                <c.Icon />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MidiButton({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) {
  return (
    <div className={clsx("t3", styles.midiButton)} onClick={onClick}>
      {text}
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
  deactivated = false,
}: {
  onClick: () => void;
  imgs: { active: IconComponent; inactive: IconComponent };
  active?: boolean;
  deactivated?: boolean;
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
        [styles.frozen]: deactivated,
      })}
      onClick={handleClick}
    >
      <Icon />
    </div>
  );
}

export function NavLinkButton({
  to,
  Img,
}: {
  to: string;
  Img?: IconComponent;
}) {
  return (
    <div>
      <Link to={to}>{Img ? <Img /> : to}</Link>
    </div>
  );
}

export function OptionButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  const [isActive, setIsActive] = useState(false);
  return (
    <div
      className={clsx(styles.optionButton, { [styles.activeOption]: isActive })}
      onClick={() => {
        onClick;
        setIsActive((s) => !s);
      }}
    >
      <div>{text}</div>
    </div>
  );
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
