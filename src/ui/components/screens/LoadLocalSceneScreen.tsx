import { useNavigate } from "react-router";
import { ActionButton } from "../atoms/Button";
import { NavTitle } from "../atoms/Navigation";
import { TextBlock } from "../atoms/Output";
import { ImportInputGroup } from "../molecules/import/ImportInputGroup";
import { useImportPreview } from "../molecules/import/useImportPreview";
import { useTransfer } from "@/app/ApplicationKernelContext";
import info from "@/assets/images/icons/descriptive/info.svg";

export default function LoadLocalSceneScreen() {
  const textContent = {
    title: "Загрузка с устройства",
    text: `Загружайте для дальнейшего просмотра и редактирования модели с вашего устройства в форматах .obj, .fbx и .glb.`,
    textListItems: null,
  };

  const transfer = useTransfer();
  const navigate = useNavigate();
  const {
    status,
    preview,
    error,
    sourceLabel,
    prepareFromDevice,
    reportError,
    commitImport,
  } = useImportPreview(transfer);

  const handleImport = async () => {
    try {
      await commitImport();
      navigate("/editor");
    } catch {
      // ошибка уже показана через notification / state
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "20px  ",
        }}
      >
        <NavTitle title={textContent.title} to={"/"} />
        <TextBlock
          text={textContent.text}
          textListItems={textContent.textListItems}
          iconSrc={info}
        />
        <ImportInputGroup
          mode="device"
          status={status}
          preview={preview}
          error={error}
          sourceLabel={sourceLabel}
          onSourceReady={prepareFromDevice}
          onParseError={reportError}
        />
        <div className="import-input-group__action">
          <ActionButton
            text="Импортировать модель"
            onClick={handleImport}
            disabled={status !== "ready"}
          />
        </div>
      </div>
    </div>
  );
}
