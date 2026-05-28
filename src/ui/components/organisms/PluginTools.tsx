import { ToolButton } from "../atoms/Button";
import { useSessionStore } from "@/store/sessionStore";

import langRu from "@/assets/images/icons/state/langRu.svg";
import langEn from "@/assets/images/icons/state/langEn.svg";
import themeLight from "@/assets/images/icons/state/themeL.svg";
import themeDark from "@/assets/images/icons/state/themeD.svg";
import textD from "@/assets/images/icons/state/fontSizeL.svg";
import textU from "@/assets/images/icons/state/fontSizeS.svg";
import windowD from "@/assets/images/icons/state/windowSizeL.svg";
import windowU from "@/assets/images/icons/state/windowSizeS.svg";
import help from "@/assets/images/icons/descriptive/info.svg";

export function PluginTools({}) {
  const colorTheme = useSessionStore((s) => s.colorTheme);
  const toggleColorTheme = useSessionStore((s) => s.toggleColorTheme);
  const toggleWindowSize = useSessionStore((s) => s.toggleWindowSize);

  return (
    <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
      <div className="tools-container">
        <ToolButton src={langRu} onClick={() => console.log("")} />
        <ToolButton
          src={colorTheme === "Dark" ? themeDark : themeLight}
          onClick={toggleColorTheme}
        />
        <ToolButton src={textU} onClick={() => console.log("")} />
        <ToolButton src={windowD} onClick={toggleWindowSize} />
      </div>
      <div className="tools-container">
        <ToolButton
          src={help}
          onClick={() => useSessionStore.getState().setHelpModalOpen(true)}
        />
      </div>
    </div>
  );
}
