import { NavLink } from "react-router";
import { SceneRenderer } from "../viewport/SceneViewport";

export default function EditorPage() {
  return (
    <div>
      Editor Page
      <NavLink to="/">Main</NavLink>
      <SceneRenderer />
    </div>
  );
}
