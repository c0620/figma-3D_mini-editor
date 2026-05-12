import { useState } from "react";
import { MainButton } from "../atoms/Button";
import { FigmaInput, FileInput } from "../atoms/Input";
import { NavTitle } from "../atoms/Navigation";
import { TextBlock } from "../atoms/Output";

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

  let currentTextContent =
    type == "figma" ? textContent.figma : textContent.local;

  const [sceneLoadStatus, setSceneLoadStatus] = useState("initial");

  let currentScreenContent;
  // switch (sceneLoadStatus) {
  //   case "initial":
  //     currentScreenContent = type == "figma" ? <FigmaInput /> : <FileInput />;
  //     break;
  //   case "error":
  //     currentScreenContent =
  //       type == "figma" ? <FigmaInput error={"error"} /> : <FileInput />;
  //     break;
  //   case "success":
  //     if (type == "figma") {
  //       currentScreenContent = (
  //         <div>
  //           <FigmaInput success />
  //           <div>Info component?</div>
  //           <div>Scene Render Preview</div>
  //           <div>Scene Textures Preview</div>
  //         </div>
  //       );
  //     } else {
  //     }
  //     break;
  // }

  return (
    <div>
      <NavTitle title={currentTextContent.title} to={"/"} />
      <TextBlock
        text={currentTextContent.text}
        textListItems={currentTextContent.textListItems}
      />
      {currentScreenContent}
      <MainButton text="Импортировать модель" />
    </div>
  );
}
