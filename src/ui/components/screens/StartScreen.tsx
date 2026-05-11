import { NavLink } from "react-router";
import { CardLoading } from "../molecules/Cards";

export default function StartScreen() {
  return (
    <>
      <div>settings</div>
      <h1 className="">3D: мини-редактор</h1>
      <div>
        Переносите собственные или готовые модели, создавайте и редактируйте
        рендеры прямо в Figma
      </div>
      <div>
        <CardLoading image={""} />
        <CardLoading />
        <CardLoading />
      </div>
      <NavLink to="/editor">Editor</NavLink>
    </>
  );
}
