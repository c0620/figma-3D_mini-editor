import type { Dispatch, SetStateAction } from "react";
import { NavLinkButton } from "./Button";
import type { PanelMode } from "../organisms/PanelScene";

export function PanelModeToggle({
  mode,
  setMode,
}: {
  mode: PanelMode;
  setMode: Dispatch<SetStateAction<PanelMode>>;
}) {
  return (
    <button
      onClick={() => {
        mode == "open" ? setMode("close") : setMode("open");
      }}
    >
      {mode == "open" ? "<" : ">"}
    </button>
  );
}

export function NavTitle({ title, to }: { title: string; to: string }) {
  return (
    <div>
      <NavLinkButton to={to} />
      {title}
    </div>
  );
}
