import type { SceneFileType } from "@/io/sceneTransferFacade";
import styles from "./FileInputs.module.scss";
import { useRef, useState } from "react";
import FileIcon from "@/assets/images/icons/descriptive/file.svg?react";
import UploadIcon from "@/assets/images/icons/descriptive/loadFile.svg?react";

import clsx from "clsx";

export function FileInput({
  onUpload,
  error: _error = null,
  success: _success = true,
}: {
  onUpload: (type: SceneFileType, file: File) => void;
  error?: any;
  success?: boolean;
}) {
  const inputRef = useRef<null | HTMLInputElement>(null);
  const [fileName, setFileName] = useState<null | string>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const fileType = file.name.split(".")[1].toUpperCase();
    onUpload(fileType as SceneFileType, file); //ToDo: check if fileType is really SceneFileType
  };

  return (
    <form
      className={clsx(styles.form, { [styles.load]: fileName })}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileChange(e.dataTransfer.files?.[0] ?? null);
      }}
    >
      {fileName ? <FileIcon /> : <UploadIcon />}
      <label className="h2">
        {fileName ??
          "Перетяните сюда файл или кликните для открытия проводника"}
        {fileName && (
          <p className="t2" style={{ fontWeight: "400", lineHeight: "120%" }}>
            Для загрузки нового файла перетяните его в эту область или кликните
            для открытия проводника
          </p>
        )}
        <input
          ref={inputRef}
          className={styles.input}
          type="file"
          onChange={(e) =>
            handleFileChange(e.target.files ? e.target.files[0] : null)
          }
          hidden
        />
      </label>
    </form>
  );
}

export function FigmaInput({
  error = null,
  success = true,
}: {
  error?: any;
  success?: boolean;
}) {
  return (
    <div>
      FileInput {error ? error : ""} {success ? "success" : ""}
    </div>
  );
}
