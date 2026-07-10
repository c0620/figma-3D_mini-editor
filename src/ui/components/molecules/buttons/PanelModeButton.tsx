import { useContext } from "react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";
import { ActionButton } from "../../atoms/buttons/Button";
import type { IconComponent } from "../../types/icon";

export function PanelModeButton({
  text,
  img,
  onClick,
}: {
  text?: string;
  img?: IconComponent;
  onClick: () => void;
}) {
  const mode = useContext(PanelSceneModeContext);

  if (mode == "close") return <ActionButton onClick={onClick} img={img} />;
  return <ActionButton onClick={onClick} text={text} />;
}
