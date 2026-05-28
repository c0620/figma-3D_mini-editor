import type { ReactNode } from "react";
import { Link } from "react-router";
import styles from "./Button.module.css";
import arrowL from "@/assets/images/icons/descriptive/arrowL.svg";

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
  disabled = false,
  className,
}: {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  className?: string;
}) {
  const base = disabled ? styles.actionButtonDis : styles.actionButton;
  const classes = [base, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      style={{
        pointerEvents: disabled ? "none" : "auto",
      }}
      onClick={disabled ? undefined : onClick}
    >
      {text}
    </div>
  );
}

export function NavLinkButton({ to }: { to: string }) {
  return (
    <Link className={styles.navLinkButton} to={to}>
      <img src={arrowL} alt="" />
    </Link>
  );
}

export function OptionButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.optionButton} onClick={onClick}>
      {text}
    </button>
  );
}

export function ActionButtonIcon({
  onClick,
  src,
}: {
  onClick: () => void;
  src: string;
}) {
  return (
    <div onClick={onClick} style={{ backgroundColor: "black" }}>
      <img src={src} alt="" />
    </div>
  );
}

export function EditorIconButton({
  src,
  onClick,
  active = false,
  disabled = false,
  title,
  children,
  className,
}: {
  src: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const classes = [
    styles.editorIconButton,
    active ? styles.editorIconButtonActive : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      title={title}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <img src={src} alt="" />
      {children}
    </button>
  );
}

/** @deprecated Use EditorIconButton with a real icon src */
export function PanelButton({
  url,
  onClick,
  children,
  active = false,
  disabled = false,
  label,
}: {
  url: string;
  onClick?: () => void;
  children?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <EditorIconButton
      src={url}
      onClick={onClick}
      active={active}
      disabled={disabled}
      title={label ?? url}
    >
      {children}
    </EditorIconButton>
  );
}

export function PanelCtaButton({
  text,
  onClick,
  disabled = false,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.panelCtaButton}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {text}
    </button>
  );
}

export function ToolButton({
  src,
  onClick,
}: {
  src: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.editorIconButton} onClick={onClick}>
      <img src={src} alt="" />
    </button>
  );
}
