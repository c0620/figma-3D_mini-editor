import { usePanelCompact } from "../organisms/PanelScene";
import compactStyles from "../organisms/PanelCompact.module.css";

export function PanelSectionHeading({
  text,
  iconSrc,
  className = "panel-editor-section-heading",
  headingLevel = "p",
}: {
  text: string;
  iconSrc: string;
  className?: string;
  headingLevel?: "p" | "h3";
}) {
  const compact = usePanelCompact();

  if (compact) {
    return (
      <img
        className={compactStyles.sectionIconHeader}
        src={iconSrc}
        alt=""
        title={text}
      />
    );
  }

  if (headingLevel === "h3") {
    return <h3 className={className}>{text}</h3>;
  }

  return <p className={className}>{text}</p>;
}
