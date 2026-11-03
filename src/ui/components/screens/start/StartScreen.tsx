import phone from "@images/start-phone.png";
import sphere from "@images/start-sphere.png";
import suzanne from "@images/start-suzanne.png";

import styles from "./StartScreen.module.scss";
import { CardStart } from "@molecules/cards/CardStart/CardStart";
import { TopTools } from "../../templates/tools/TopTools";

export default function StartScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.circle} />
      <TopTools type="app" />
      <div className={styles.text}>
        <h1 className="titleStart">3D: мини-редактор</h1>
        <p className="textStart">
          Переносите собственные или готовые модели, создавайте и редактируйте
          рендеры прямо в Figma
        </p>
      </div>
      <div className={styles.cards}>
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
    </div>
  );
}
