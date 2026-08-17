import { useSessionStore } from "@/store/sessionStore";
import styles from "./Modal.module.scss";
import Close from "@/assets/images/icons/descriptive/closeX.svg?react";
import { MidiButton, SmallButton } from "../../atoms/buttons/Button";

export function Modal({
  title,
  buttonTitle,
  buttonAction,
  children,
}: {
  title: string;
  buttonTitle?: string;
  buttonAction?: () => void;
  children: React.ReactNode;
}) {
  const modalAction = useSessionStore((s) => s.setModalType);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.window}>
          <div className={styles.header}>
            <h1>{title}</h1>
            <div className={styles.headerButtons}>
              {buttonAction && buttonTitle && (
                <MidiButton onClick={buttonAction} text={buttonTitle} />
              )}
              <button onClick={() => modalAction(null)}>
                <Close />
              </button>
            </div>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </>
  );
}
