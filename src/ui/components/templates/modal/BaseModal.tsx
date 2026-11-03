import { useSessionStore } from "@/store/sessionStore";
import styles from "./BaseModal.module.scss";
import Close from "@images/icons/descriptive/closeX.svg?react";
import { MidiButton, SmallButton } from "@atoms/buttons/Button";

export function BaseModal({
  size,
  title,
  buttonTitle,
  buttonAction,
  children,
}: {
  size: "default" | "mini";
  title: string;
  buttonTitle?: string;
  buttonAction?: () => void;
  children: React.ReactNode;
}) {
  const modalAction = useSessionStore((s) => s.setModalType);
  return (
    <>
      <div className={styles.container}>
        <div className={size == "default" ? styles.window : styles.windowMini}>
          {size == "default" && (
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
          )}
          <div
            className={size == "default" ? styles.content : styles.contentMini}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
