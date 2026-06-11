import { SquareButton, SquareStateButton } from "../../atoms/buttons/Button";
import styles from "./Tools.module.scss";

import del from "@/assets/images/icons/descriptive/garbage.svg";
import bgOff from "@/assets/images/icons/state/bgOff.svg";
import bgOn from "@/assets/images/icons/state/bgOn.svg";
import shadowsOff from "@/assets/images/icons/state/shadowsOff.svg";
import shadowsOn from "@/assets/images/icons/state/shadowsOn.svg";
import info from "@/assets/images/icons/descriptive/info.svg";
import render from "@/assets/images/icons/descriptive/render.svg";

export function TopTools() {
  return (
    <div className={styles.toolsRow}>
      <div className={styles.tool}>
        <SquareButton onClick={() => console.log("delete")} img={del} />
        <SquareButton onClick={() => console.log("delete")} img={del} />
        <SquareStateButton
          onClick={() => console.log("delete")}
          imgs={{ active: bgOff, inactive: bgOn }}
        />
        <SquareStateButton
          onClick={() => console.log("delete")}
          imgs={{ active: shadowsOff, inactive: shadowsOn }}
        />
      </div>
      <div className={styles.tool}>
        <SquareButton onClick={() => console.log("delete")} img={info} />
      </div>
      <div className={(styles.tool, styles.toolAccent)}>
        <SquareButton onClick={() => console.log("delete")} img={render} />
      </div>
    </div>
  );
}
