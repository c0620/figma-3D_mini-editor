import { SquareButton, SquareStateButton } from "../../atoms/buttons/Button";
import styles from "./Tools.module.scss";

import leave from "@/assets/images/icons/descriptive/leave.svg?react";
import del from "@/assets/images/icons/descriptive/garbage.svg?react";
import bgOff from "@/assets/images/icons/state/bgOff.svg?react";
import bgOn from "@/assets/images/icons/state/bgOn.svg?react";
import shadowsOff from "@/assets/images/icons/state/shadowsOff.svg?react";
import shadowsOn from "@/assets/images/icons/state/shadowsOn.svg?react";
import info from "@/assets/images/icons/descriptive/info.svg?react";
import render from "@/assets/images/icons/descriptive/render.svg?react";

export function TopTools() {
  return (
    <div className={styles.toolsRow}>
      <div className={styles.tool}>
        <SquareButton onClick={() => console.log("delete")} img={leave} />
        <SquareButton onClick={() => console.log("delete")} img={del} />
      </div>
      <div className={styles.tool}>
        {" "}
        <SquareStateButton
          onClick={() => console.log("delete")}
          imgs={{ active: bgOff, inactive: bgOn }}
        />
        <SquareStateButton
          onClick={() => console.log("delete")}
          imgs={{ active: shadowsOff, inactive: shadowsOn }}
        />
        <SquareButton onClick={() => console.log("delete")} img={info} />
      </div>
      <div className={(styles.tool, styles.toolAccent)}>
        <SquareButton onClick={() => console.log("delete")} img={render} />
      </div>
    </div>
  );
}
