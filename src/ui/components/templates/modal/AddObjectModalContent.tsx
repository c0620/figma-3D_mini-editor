import { useRef, useState } from "react";
import { Modal } from "./Modal";
import {
  ActionButton,
  MainButton,
  OptionButton,
} from "../../atoms/buttons/Button";
import { CardAsset } from "../../molecules/cards/Cards";
import styles from "./AddObjectModalContent.module.scss";
import { FileInput } from "../../atoms/inputs/FileInputs";
import { useSceneAddition } from "@/app/ApplicationKernelContext";
import type { SceneFileType } from "@/io/sceneTransferFacade";
import { useSessionStore } from "@/store/sessionStore";
import { Torus } from "@react-three/drei";

export function AssetPreview({ assetId }: { assetId: string }) {
  return <Torus />;
}

export function AddObjectModalContent() {
  const modalAction = useSessionStore((s) => s.setModalType);
  const addObject = useSceneAddition();

  const [loadType, setLoadType] = useState<"local" | "library">("library");

  const [file, setFile] = useState<{ type: SceneFileType; input: File } | null>(
    null
  );
  const [hoverID, setHoverID] = useState<string | null>(null);

  const mockCards: CardAsset[] = [];
  for (var i = 0; i < 50; i++) {
    let toPush = {
      id: i.toString(),
      title: "Test Asset",
      description: "Размер файла: 10МБ Количество полигонов: 102020",
      tag: "test",
      image: "t",
    };
    if (i % 2) {
      toPush.tag = "best";
    }
    mockCards.push(toPush);
  }

  return (
    <Modal
      title="Добавить объект"
      buttonTitle={
        loadType == "library"
          ? "Загрузить с устройства"
          : "Загрузить из библиотеки ассетов"
      }
      buttonAction={() =>
        loadType == "library" ? setLoadType("local") : setLoadType("library")
      }
    >
      {loadType == "library" ? (
        <div>
          <div className={styles.row}>
            <h3>{mockCards.length} ассетов по 1 категории</h3>
            <div className={styles.tabRow}>
              <OptionButton
                text={"Все"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <OptionButton
                text={"Все"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <OptionButton
                text={"Все"}
                onClick={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
          <div className={styles.library}>
            {mockCards.map((card) => (
              <CardAsset
                card={card}
                toggleActiveID={(v) => setHoverID(v)}
                isActive={card.id == hoverID}
                onClick={() => {
                  throw new Error("CardAsset: addition not implemented");
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.loadForm}>
          <FileInput onUpload={(type, input) => setFile({ type, input })} />
          <MainButton
            text="Добавить в сцену"
            onClick={() => {
              if (file) {
                addObject({
                  source: "device",
                  type: file.type,
                  input: file.input,
                  intent: "AddScene",
                }).then(() => modalAction(null));
              }
            }}
            frozen={file == null}
          />
        </div>
      )}
    </Modal>
  );
}
