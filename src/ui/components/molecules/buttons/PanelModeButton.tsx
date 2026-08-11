import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { ActionButton, type ButtonProps } from "../../atoms/buttons/Button";
import type { IconComponent } from "../../types/icon";

export function PanelModeButton({
  text,
  img,
  onClick,
  deactivated = false,
}: ButtonProps) {
  const mode = useContext(PanelSceneModeContext);

  if (mode == "close")
    return (
      <ActionButton onClick={onClick} img={img} deactivated={deactivated} />
    );
  return (
    <ActionButton onClick={onClick} text={text} deactivated={deactivated} />
  );
}
