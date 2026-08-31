import { ActionButton, type ButtonProps } from "../../atoms/buttons/Button";

export function PanelModeButton({
  text,
  img,
  onClick,
  deactivated = false,
  isOpen,
}: ButtonProps & { isOpen: boolean }) {

  if (!isOpen)
    return (
      <ActionButton onClick={onClick} img={img} deactivated={deactivated} />
    );
  return (
    <ActionButton onClick={onClick} text={text} deactivated={deactivated} />
  );
}
