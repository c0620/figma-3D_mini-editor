import { SquareButton, SquareStateButton } from "@atoms/buttons/Button";
import styles from "./Tools.module.scss";
import clsx from "clsx";

import languageEn from "@images/icons/state/langEn.svg?react";
import languageRu from "@images/icons/state/langRu.svg?react";
import themeD from "@images/icons/state/themeD.svg?react";
import themeL from "@images/icons/state/themeL.svg?react";
import windowL from "@images/icons/state/windowSizeL.svg?react";
import windowS from "@images/icons/state/windowSizeS.svg?react";

import leave from "@images/icons/descriptive/leave.svg?react";
import del from "@images/icons/descriptive/garbage.svg?react";
import bgOff from "@images/icons/state/bgOff.svg?react";
import bgOn from "@images/icons/state/bgOn.svg?react";
import shadowsOff from "@images/icons/state/shadowsOff.svg?react";
import shadowsOn from "@images/icons/state/shadowsOn.svg?react";
import info from "@images/icons/descriptive/info.svg?react";
import render from "@images/icons/descriptive/render.svg?react";
import { useNavigate } from "react-router";
import { useSessionStore } from "@/store/sessionStore";

export function TopTools() {
  const navigate = useNavigate();
  const openExport = useSessionStore((s) => s.setModalType);
  return (
    <div className={styles.toolsRow}>
      <div className={styles.tool}>
        <SquareButton onClick={() => navigate("/")} img={leave} />
        <SquareButton onClick={() => console.log("delete")} img={del} />
      </div>
      <div className={styles.tool}>
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
      <div className={clsx(styles.tool, styles.toolAccent)}>
        <SquareButton onClick={() =>openExport("export")} img={render} />
      </div>
    </div>
  );
}
