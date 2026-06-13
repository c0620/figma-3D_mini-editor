import { SquareButton, SquareStateButton } from "../../atoms/buttons/Button";

import styles from "./Tools.module.scss";

import translateIcon from "@/assets/images/icons/descriptive/pan.svg";
import rotateIcon from "@/assets/images/icons/descriptive/rotate.svg";
import scaleIcon from "@/assets/images/icons/descriptive/scale.svg";
import undoIcon from "@/assets/images/icons/descriptive/undo.svg";
import redoIcon from "@/assets/images/icons/descriptive/redo.svg";
import { useHistory, type ActiveEntity } from "@/app/ApplicationKernelContext";
import { useSessionStore, type ObjectToolMode } from "@/store/sessionStore";

export function BottomTools({ activeObj }: { activeObj: ActiveEntity | null }) {
  const activeTool = useSessionStore().activeObjectTool;
  const setActiveTool = useSessionStore().setActiveObjectTool;
  const toggleActiveTool = (tool: ObjectToolMode) => {
    if (!activeTool || activeTool != tool) setActiveTool(tool);
    if (activeTool == tool) setActiveTool(null);
  };

  const { undo, redo } = useHistory();

  return (
    <div className={styles.toolsRow}>
      {activeObj && (
        <div className={styles.tool}>
          <SquareStateButton
            onClick={() => toggleActiveTool("translate")}
            imgs={{ active: translateIcon, inactive: translateIcon }}
            active={activeTool === "translate"}
          />
          <SquareStateButton
            onClick={() => toggleActiveTool("rotate")}
            imgs={{ active: rotateIcon, inactive: rotateIcon }}
            active={activeTool === "rotate"}
          />
          <SquareStateButton
            onClick={() => toggleActiveTool("scale")}
            imgs={{ active: scaleIcon, inactive: scaleIcon }}
            active={activeTool === "scale"}
          />
        </div>
      )}

      <div className={styles.tool}>
        <SquareButton
          onClick={() => undo()}
          img={undoIcon}
          deactivated={!useSessionStore().canUndo}
        />

        <SquareButton
          onClick={() => redo()}
          img={redoIcon}
          deactivated={!useSessionStore().canRedo}
        />
      </div>
    </div>
  );
}
