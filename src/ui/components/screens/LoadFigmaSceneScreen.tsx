import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ActionButton } from "../atoms/Button";
import { NavTitle } from "../atoms/Navigation";
import { TextBlock } from "../atoms/Output";
import { ImportInputGroup } from "../molecules/import/ImportInputGroup";
import { useImportPreview } from "../molecules/import/useImportPreview";
import { useTransfer } from "@/app/ApplicationKernelContext";
import type { LinkedSelectionSummary } from "@/figma/figmaMessages";

export default function LoadFigmaSceneScreen({
  type,
}: {
  type: "figma" | "local";
}) {
  const textContent = {
    figma: {
      title: "Загрузка из Figma",
      text: `Продолжайте работу с ранее загруженной в Figma 3D-сценой без повторной настройки материалов и камеры.
Вы можете импортировать сцену с любого аккаунта и устройства.
Для работы с данной функцией:`,
      textListItems: [
        "Экспортируйте сцену в Figma как связанный рендер",
        "Не удаляйте файлы текстур, экспортированные вместе с рендером",
        "В Figma выберите фрейм со связанным рендером — сцена будет загружена автоматически",
      ],
    },
    local: {
      title: "Загрузка с устройства",
      text: `Загружайте для дальнейшего просмотра и редактирования модели с вашего устройства в форматах .obj, .fbx и .glb.`,
      textListItems: null,
    },
  };

  const currentTextContent =
    type === "figma" ? textContent.figma : textContent.local;

  const transfer = useTransfer();
  const navigate = useNavigate();
  const {
    status,
    preview,
    error,
    sourceLabel,
    prepareFromDevice,
    prepareFromFigma,
    reportError,
    reset,
    commitImport,
  } = useImportPreview(transfer);

  const [selectedFrame, setSelectedFrame] =
    useState<LinkedSelectionSummary | null>(null);

  useEffect(() => {
    if (type !== "figma") return;

    return transfer.subscribeFigmaLinkedSelection((frame) => {
      setSelectedFrame(frame);
      if (frame) {
        void prepareFromFigma(frame);
      } else {
        reset();
      }
    });
  }, [type, transfer, prepareFromFigma, reset]);

  const handleImport = async () => {
    try {
      await commitImport();
      navigate("/editor");
    } catch {
      // ошибка уже показана через notification / state
    }
  };

  const handleClearSelection = () => {
    reset();
    setSelectedFrame(null);
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "20px  ",
        }}
      >
        <NavTitle title={currentTextContent.title} to={"/"} />
        <TextBlock
          text={currentTextContent.text}
          textListItems={currentTextContent.textListItems}
        />
        <>
          <ImportInputGroup
            mode="figma"
            status={status}
            preview={preview}
            error={error}
            sourceLabel={sourceLabel}
            selectedFrame={selectedFrame}
            onClear={handleClearSelection}
          />
        </>
        <div className="import-input-group__action">
          <ActionButton
            text="Импортировать модель"
            onClick={handleImport}
            disabled={status !== "ready"}
          />
        </div>
      </div>
    </div>
  );
}
