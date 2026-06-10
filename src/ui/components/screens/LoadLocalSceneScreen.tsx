import { useState } from "react";
import { MainButton } from "../atoms/buttons/Button";
import { NavTitle } from "../atoms/buttons/Navigation";
import { useTransfer } from "@/app/ApplicationKernelContext";
import { FileInput } from "../atoms/inputs/FileInputs";
import { TextBlock } from "../atoms/outputs/TextBlock";
export default function LoadLocalSceneScreen() {
  const textContent = {
    title: "Загрузка с устройства",
    text: `Загружайте для дальнейшего просмотра и редактирования модели с вашего устройства в форматах .obj, .fbx и .glb.`,
    textListItems: null,
  };

  const transferFacade = useTransfer();
  const [sceneLoadStatus, setSceneLoadStatus] = useState("initial");

  return (
    <div>
      <NavTitle title={textContent.title} to={"/"} />
      <TextBlock
        text={textContent.text}
        textListItems={textContent.textListItems}
      />
      <FileInput onUpload={transferFacade.importSceneFromDevice} />
      <MainButton text="Импортировать модель" action="nav" to="/editor" />
    </div>
  );
}
