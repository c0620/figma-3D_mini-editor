import { SquareButton, SquareStateButton } from "../../atoms/buttons/Button";

import styles from "./Tools.module.scss";

import pan from "@/assets/images/icons/descriptive/pan.svg";
import rotate from "@/assets/images/icons/descriptive/rotate.svg";
import scale from "@/assets/images/icons/descriptive/scale.svg";
import undo from "@/assets/images/icons/descriptive/undo.svg";
import redo from "@/assets/images/icons/descriptive/redo.svg";
import type { ActiveEntity } from "@/app/ApplicationKernelContext";
import { useSessionStore, type ObjectToolMode } from "@/store/sessionStore";

export function BottomTools({ activeObj }: { activeObj: ActiveEntity | null }) {
  const activeTool = useSessionStore().activeObjectTool;
  const setActiveTool = useSessionStore().setActiveObjectTool;
  const toggleActiveTool = (tool: ObjectToolMode) => {
    if (!activeTool || activeTool != tool) setActiveTool(tool);
    if (activeTool == tool) setActiveTool(null);
  };

  return (
    <div className={styles.toolsRow}>
      {activeObj && (
        <div className={styles.tool}>
          <SquareStateButton
            onClick={() => toggleActiveTool("translate")}
            imgs={{ active: pan, inactive: pan }}
            active={activeTool === "translate"}
          />
          <SquareStateButton
            onClick={() => toggleActiveTool("rotate")}
            imgs={{ active: rotate, inactive: rotate }}
            active={activeTool === "rotate"}
          />
          <SquareStateButton
            onClick={() => toggleActiveTool("scale")}
            imgs={{ active: scale, inactive: scale }}
            active={activeTool === "scale"}
          />
        </div>
      )}

      <div className={styles.tool}>
        <SquareButton onClick={() => console.log("delete")} img={undo} />
        <SquareButton onClick={() => console.log("delete")} img={redo} />
      </div>
    </div>
  );
}
