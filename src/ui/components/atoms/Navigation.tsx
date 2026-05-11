import { NavButton } from "./Button";

export function PanelModeToggle() {
  return <div>arrow</div>;
}

export function NavTitle({ title }: { title: string }) {
  return (
    <div>
      <NavButton />
      {title}
    </div>
  );
}
