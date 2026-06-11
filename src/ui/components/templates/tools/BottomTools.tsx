import { SquareButton, SquareStateButton } from "../../atoms/buttons/Button";

import styles from "./Tools.module.scss";

import pan from "@/assets/images/icons/descriptive/pan.svg";
import rotate from "@/assets/images/icons/descriptive/rotate.svg";
import scale from "@/assets/images/icons/descriptive/scale.svg";
import undo from "@/assets/images/icons/descriptive/undo.svg";
import redo from "@/assets/images/icons/descriptive/redo.svg";
import type { ActiveEntity } from "@/app/ApplicationKernelContext";

export function BottomTools({ activeObj }: { activeObj: ActiveEntity | null }) {
  return (
    <div className={styles.toolsRow}>
      {activeObj && (
        <div className={styles.tool}>
          <SquareStateButton
            onClick={() => console.log("delete")}
            imgs={{ active: pan, inactive: pan }}
          />
          <SquareStateButton
            onClick={() => console.log("delete")}
            imgs={{ active: rotate, inactive: rotate }}
          />
          <SquareStateButton
            onClick={() => console.log("delete")}
            imgs={{ active: scale, inactive: scale }}
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
