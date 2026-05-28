import type { Dispatch, SetStateAction } from "react";
import { NavLinkButton, OptionButton } from "./Button";
import type { PanelMode } from "../organisms/PanelScene";
import styles from "@/ui/components/atoms/Navigation.module.css";
import arrowL from "@/assets/images/icons/descriptive/arrowL.svg";
import arrowR from "@/assets/images/icons/descriptive/arrowR.svg";

export function PanelModeToggle({
  mode,
  setMode,
}: {
  mode: PanelMode;
  setMode: Dispatch<SetStateAction<PanelMode>>;
}) {
  var action: PanelMode;
  var arrow: string;
  switch (mode) {
    case "openL":
      action = "closeL";
      arrow = arrowL;
      break;
    case "openR":
      action = "closeR";
      arrow = arrowR;
      break;
    case "closeL":
      action = "openL";
      arrow = arrowR;
      break;
    case "closeR":
      action = "openR";
      arrow = arrowL;
  }
  return (
    <button
      onClick={() => {
        mode == "openL" || mode == "openR" ? setMode(action) : setMode(action);
      }}
    >
      <img src={arrow} />
    </button>
  );
}

export function NavTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className={styles.navTitle}>
      <NavLinkButton to={to} />
      <h1 className={styles.navTitleText}>{title}</h1>
    </div>
  );
}

export function NavModal({
  title,
  switchText,
  switchMode,
  onClose,
}: {
  title: string;
  switchText: string;
  switchMode: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <p>{title}</p>{" "}
      <OptionButton onClick={switchMode} text={switchText}></OptionButton>
      <img onClick={onClose}></img>
    </div>
  );
}
