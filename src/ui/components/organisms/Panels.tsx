import { ActionButton } from "../atoms/Button";
import { InputText } from "../atoms/Input";
import { ScrollPanel } from "../atoms/Output";
import { GraphItem } from "../atoms/SceneGraph";
import { PanelModeToggle } from "../atoms/Navigation";

export function ScenePanel() {
  return (
    <div>
      <div>
        <PanelModeToggle />
        Содержимое сцены
        <ScrollPanel>
          <GraphItem></GraphItem>
        </ScrollPanel>
        <ActionButton />
        <ActionButton />
      </div>
      <div>Редактирование объекта Object Name</div>
      Параметр 1
      <div>
        <InputText />
        <InputText />
        <InputText />
      </div>
    </div>
  );
}

export function ObjectPanel() {}
