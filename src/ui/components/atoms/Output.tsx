import { useContext } from "react";
import { PanelSceneModeContext } from "../organisms/Panels";

export function TextBlock({
  text,
  textListItems,
}: {
  text: string;
  textListItems: Array<string> | null;
}) {
  return (
    <div>
      {text} {textListItems && textListItems.map((item) => <p>{item}</p>)}
    </div>
  );
}
export function ScrollPanel({ children }: { children: any }) {
  const mode = useContext(PanelSceneModeContext);
  if (mode == "open") {
    return <div>Open {children}</div>;
  } else {
    return <div>Close {children}</div>;
  }
}
