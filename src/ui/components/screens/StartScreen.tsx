import { CardStart } from "../molecules/Cards";
import phone from "../../../assets/images/start-phone.png";
import sphere from "../../../assets/images/start-sphere.png";
import suzanne from "../../../assets/images/start-suzanne.png";

export default function StartScreen() {
  return (
    <>
      <div>settings</div>
      <h1 className="">3D: мини-редактор</h1>
      <div>
        Переносите собственные или готовые модели, создавайте и редактируйте
        рендеры прямо в Figma
      </div>
      <div style={{ display: "flex" }}>
        <CardStart
          title="Библиотека ассетов"
          text="Импорт готовых простых объектов и моделей для мокапов"
          image={phone}
          to="/library"
        />
        <CardStart
          title="Загрузка из Figma"
          text="Восстановление сцены из фрейма Figma"
          image={sphere}
          to="/load/figma"
        />
        <CardStart
          title="Загрузка с устройства"
          text="Импорт моделей в форматах .fbx, .obj и .glb"
          image={suzanne}
          to="/load/local"
        />
      </div>
    </>
  );
}
