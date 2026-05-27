import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ActionButton } from "../atoms/Button";
import { FigmaInput, FileInput } from "../atoms/Input";
import { NavTitle } from "../atoms/Navigation";
import { TextBlock } from "../atoms/Output";
import { useTransfer } from "@/app/ApplicationKernelContext";
import type { LinkedSelectionSummary } from "@/figma/figmaMessages";

type LoadStatus = "initial" | "ready" | "error" | "success";

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
    type == "figma" ? textContent.figma : textContent.local;

  const transfer = useTransfer();
  const navigate = useNavigate();
  const [sceneLoadStatus, setSceneLoadStatus] = useState<LoadStatus>("initial");
  const [selectedFrame, setSelectedFrame] =
    useState<LinkedSelectionSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (type !== "figma") return;

    return transfer.subscribeFigmaLinkedSelection((frame) => {
      setSelectedFrame(frame);
      setErrorMessage(null);
      setSceneLoadStatus(frame ? "ready" : "initial");
    });
  }, [type, transfer]);

  const handleImport = async () => {
    if (type !== "figma" || !selectedFrame) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      await transfer.importSceneFromFigma(selectedFrame.frameId);
      setSceneLoadStatus("success");
      navigate("/editor");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось импортировать сцену";
      setErrorMessage(message);
      setSceneLoadStatus("error");
    } finally {
      setIsImporting(false);
    }
  };

  let currentScreenContent;
  switch (sceneLoadStatus) {
    case "initial":
      currentScreenContent =
        type == "figma" ? (
          <FigmaInput selectedFrame={selectedFrame} loading={isImporting} />
        ) : (
          <FileInput onUpload={transfer.importSceneFromDevice} />
        );
      break;
    case "ready":
      currentScreenContent =
        type == "figma" ? (
          <FigmaInput selectedFrame={selectedFrame} loading={isImporting} />
        ) : (
          <FileInput onUpload={transfer.importSceneFromDevice} />
        );
      break;
    case "error":
      currentScreenContent =
        type == "figma" ? (
          <FigmaInput
            selectedFrame={selectedFrame}
            error={errorMessage}
            loading={isImporting}
          />
        ) : (
          <FileInput onUpload={transfer.importSceneFromDevice} />
        );
      break;
    case "success":
      if (type == "figma") {
        currentScreenContent = (
          <div>
            <FigmaInput selectedFrame={selectedFrame} />
            <div>Info component?</div>
            <div>Scene Render Preview</div>
            <div>Scene Textures Preview</div>
          </div>
        );
      }
      break;
  }

  return (
    <div>
      <NavTitle title={currentTextContent.title} to={"/"} />
      <TextBlock
        text={currentTextContent.text}
        textListItems={currentTextContent.textListItems}
      />
      {currentScreenContent}
      {type === "figma" ? (
        <ActionButton
          text="Импортировать модель"
          onClick={handleImport}
          disabled={!selectedFrame || isImporting}
        />
      ) : (
        <>
          <FileInput onUpload={transfer.importSceneFromDevice} />
          <ActionButton
            text="Импортировать модель"
            onClick={() => navigate("/editor")}
          />
        </>
      )}
    </div>
  );
}
