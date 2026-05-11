import { NavLinkButton } from "./Button";

export function PanelModeToggle() {
  return <div>arrow</div>;
}

export function NavTitle({ title, to }: { title: string; to: string }) {
  return (
    <div>
      <NavLinkButton to={to} />
      {title}
    </div>
  );
}
