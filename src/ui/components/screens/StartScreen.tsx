import { CardStart } from "../molecules/Cards";
import phone from "../../../assets/images/start-phone.png";
import sphere from "../../../assets/images/start-sphere.png";
import suzanne from "../../../assets/images/start-suzanne.png";
import { PluginTools } from "../organisms/PluginTools";

export default function StartScreen() {
  return (
    <div className="page page_start">
      <PluginTools />
      <div>
        <h1 className="titleStart">3D: мини-редактор</h1>
        <div className="textStart" style={{ marginBottom: "var(--margin-xl)" }}>
          Переносите собственные или готовые модели, <br /> создавайте и
          редактируйте рендеры прямо в Figma
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
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
      <div className="background-start">
        <div className="circle-blur"></div>
        <div className="circle-bg"></div>
        <div className="circle-middle"></div>
        <div className="circle-top"></div>
      </div>
    </div>
  );
}
