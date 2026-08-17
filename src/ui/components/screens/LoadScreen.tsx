import { FileInput } from "../atoms/inputs/FileInputs";
import { MainButton, SquareButton } from "../atoms/buttons/Button";
import { useTransfer } from "@/app/ApplicationKernelContext";
import { NavTitle } from "../atoms/buttons/Navigation";
import styles from "./LoadScreen.module.scss";
import { TextBlock } from "../atoms/outputs/TextBlock";
import { useState } from "react";
import InfoIcon from "@/assets/images/icons/descriptive/info.svg?react";

export function LoadScreen({ type }: { type: "Local" | "Figma" }) {
  const transferFacade = useTransfer();
  const [loadStatus, setLoadStatus] = useState(false);
  return (
    <div className={styles.loadScreen}>
      <NavTitle
        title={type == "Figma" ? "Загрузка из Figma" : "Загрузка с устройства"}
        to={"/"}
      />
      <div className={styles.stack}>
        <TextBlock
          text="Загружайте для дальнейшего просмотра и редактирования модели с вашего устройства в форматах .obj, .fbx и .glb."
          Icon={InfoIcon}
        />
        <FileInput
          onUpload={(type, file) =>
            transferFacade
              .importScene({
                source: "device",
                type,
                input: file,
                intent: "LoadScene",
              })
              .then((id) => setLoadStatus(Boolean(id)))
          }
        />
      </div>
      <MainButton
        text="Импортировать модель"
        to={loadStatus ? "/editor" : null}
        frozen={!loadStatus}
      />
    </div>
  );
}
