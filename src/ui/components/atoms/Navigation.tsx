import type { Dispatch, SetStateAction } from "react";
import { NavLinkButton, OptionButton } from "./Button";
import type { PanelMode } from "../organisms/PanelScene";
import styles from "@/ui/components/atoms/Navigation.module.css";
import arrowL from "@/assets/images/icons/descriptive/arrowL.svg";
import arrowR from "@/assets/images/icons/descriptive/arrowR.svg";
import closeX from "@/assets/images/icons/descriptive/closeX.svg";

export function PanelModeToggle({
  mode,
  setMode,
}: {
  mode: PanelMode;
  setMode: Dispatch<SetStateAction<PanelMode>>;
}) {
  let action: PanelMode;
  let arrow: string;
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
      break;
  }
  return (
    <button
      type="button"
      className="panel-collapse-btn"
      onClick={() => setMode(action)}
      aria-label="Toggle panel"
    >
      <img src={arrow} alt="" />
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

export function NavModalHeader({
  title,
  titleId,
  onClose,
}: {
  title: string;
  titleId?: string;
  onClose: () => void;
}) {
  return (
    <header className={styles.modalHeader}>
      <h2 id={titleId} className={styles.modalTitle}>
        {title}
      </h2>
      <div className={styles.modalHeaderActions}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <img src={closeX} alt="" />
        </button>
      </div>
    </header>
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
    <header className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>{title}</h2>
      <div className={styles.modalHeaderActions}>
        <OptionButton onClick={switchMode} text={switchText} />
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <img src={closeX} alt="" />
        </button>
      </div>
    </header>
  );
}
