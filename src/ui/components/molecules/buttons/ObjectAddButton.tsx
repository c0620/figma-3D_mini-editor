import { useContext } from "react";
import { ChoiceButton } from "../../atoms/buttons/Button";
import arrowheadR from "@/assets/images/icons/descriptive/arrowheadR.svg?react";
import { PanelSceneModeContext } from "../../templates/panels/BasePanel";

import meshIcon from "@/assets/images/icons/descriptive/mesh.svg?react";
import lightIcon from "@/assets/images/icons/descriptive/lighting.svg?react";
import cameraIcon from "@/assets/images/icons/descriptive/cameraP.svg?react";
import { useHandlers } from "@/app/ApplicationKernelContext";
import { randomUUID } from "@/lib/randomId";
import { useSessionStore } from "@/store/sessionStore";

export function ObjectAddButton() {
  const mode = useContext(PanelSceneModeContext);
  const { objectAddition } = useHandlers();
  const openModal = useSessionStore((s) => s.setModalType);
  return (
    <ChoiceButton
      text={mode == "open" ? "Добавить" : undefined}
      img={arrowheadR}
      isLong={mode == "open"}
      choices={[
        {
          name: "Свет",
          Icon: lightIcon,
          onClick: () =>
            objectAddition.execute({ id: randomUUID(), kind: "Light" }),
        },
        {
          name: "Объект",
          Icon: meshIcon,
          onClick: () => openModal("addObject"),
        },
        {
          name: "Камера",
          Icon: cameraIcon,
          onClick: () =>
            objectAddition.execute({ id: randomUUID(), kind: "Camera" }),
        },
      ]}
    />
  );
}
