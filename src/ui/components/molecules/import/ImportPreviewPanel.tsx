import type { ImportPreviewData } from "@/types/import";
import { formatTextureCountRu } from "@/lib/sceneMeta";
import { PreviewIcon } from "../../atoms/Output";
import poly from "@/assets/images/icons/descriptive/poly.svg";
import size from "@/assets/images/icons/descriptive/sceneSize.svg";
import texturesP from "@/assets/images/icons/descriptive/texture.svg";

function formatFileSize(bytes?: number): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DeviceImportPreviewPanel({ preview }: { preview: ImportPreviewData }) {
  const { sceneMeta, textures = [] } = preview;

  return (
    <div className="import-preview-panel import-preview-panel_device">
      <div className="import-preview-panel__params-bar">
        <div className="import-preview-panel__params-title">
          <h3>Параметры импортируемой модели</h3>
        </div>
        <div className="import-preview-panel__stats">
          <div className="import-preview-panel__stat t1">
            <PreviewIcon src={poly} />{" "}
            {sceneMeta.polygonCount.toLocaleString("ru-RU")} полигонов
          </div>
          <div className="import-preview-panel__stat t1">
            <PreviewIcon src={size} /> {sceneMeta.dimensions}
          </div>
          <div className="import-preview-panel__stat t1">
            <PreviewIcon src={texturesP} />{" "}
            {formatTextureCountRu(sceneMeta.textureCount)}
          </div>
        </div>
      </div>

      <div className="import-preview-panel__visuals">
        <div className="import-preview-panel__scene-wrap">
          <img
            className="import-preview-panel__scene-image"
            src={preview.previewUrl}
            alt="Preview модели"
          />
        </div>
        <div className="import-preview-panel__textures">
          {textures.length > 0 ? (
            textures.map((texture) => (
              <div
                key={texture.id}
                className="import-preview-panel__texture-thumb"
                title={texture.name}
              >
                <img src={texture.url} alt={texture.name} />
              </div>
            ))
          ) : (
            <div className="import-preview-panel__textures-empty">
              Текстуры не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FigmaImportPreviewPanel({ preview }: { preview: ImportPreviewData }) {
  const { frameMeta, sceneMeta } = preview;

  return (
    <div className="import-preview-panel import-preview-panel_figma">
      <div className="import-preview-panel__image-wrap">
        <img
          className="import-preview-panel__image"
          src={preview.previewUrl}
          alt="Preview сцены"
        />
      </div>
      <div className="import-preview-panel__details">
        {frameMeta ? (
          <div>
            <div className="import-preview-panel__section-title">
              Параметры выбранного фрейма
            </div>
            <div className="import-preview-panel__row">
              Название: {frameMeta.frameName}
            </div>
            <div className="import-preview-panel__row">
              Проект: {frameMeta.projectName}
            </div>
            <div className="import-preview-panel__row">Связанный рендер</div>
          </div>
        ) : null}

        <div>
          <div className="import-preview-panel__section-title">
            Параметры импортируемой сцены
          </div>
          <div className="import-preview-panel__row">
            Полигоны: {sceneMeta.polygonCount.toLocaleString("ru-RU")}
          </div>
          <div className="import-preview-panel__row">
            Размер: {sceneMeta.dimensions}
          </div>
          <div className="import-preview-panel__row">
            Текстуры: {sceneMeta.textureCount}
          </div>
          <div className="import-preview-panel__row">
            Файл: {formatFileSize(sceneMeta.fileSizeBytes)}
          </div>
        </div>

        <div className="import-preview-panel__status">
          {sceneMeta.statusMessage}
        </div>
      </div>
    </div>
  );
}

export function ImportPreviewPanel({
  preview,
  variant = "figma",
}: {
  preview: ImportPreviewData;
  variant?: "device" | "figma";
}) {
  if (variant === "device") {
    return <DeviceImportPreviewPanel preview={preview} />;
  }
  return <FigmaImportPreviewPanel preview={preview} />;
}
