import type { ReactNode } from "react";
import { Link } from "react-router";

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
}: {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "black",
        opacity: disabled ? 0.4 : 1,
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
    <div>
      <Link to={to}>arrow</Link>
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
  return <div onClick={onClick}>{text}</div>;
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
      <img src={src}></img>
    </div>
  );
}

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
    <div
      onClick={disabled || !onClick ? undefined : onClick}
      style={{
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        backgroundColor: active ? "rgba(255, 89, 0, 0.35)" : undefined,
        outline: active ? "1px solid #ff5900" : undefined,
      }}
    >
      <img src={url} /> {label ?? url}
      {children}
    </div>
  );
}
