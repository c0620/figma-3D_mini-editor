import type { SceneFileType } from "@/io/sceneTransferFacade";
import type { SceneImportResources } from "@/io/sceneImportExportService";
import type { DeviceImportSource } from "@/types/import";

const MODEL_EXT: Record<string, SceneFileType> = {
  obj: "OBJ",
  fbx: "FBX",
  glb: "GLB",
};

const TEXTURE_EXT = /\.(png|jpe?g|webp|tga|bmp)$/i;

function fileExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export async function parseDeviceImportFiles(
  files: FileList | File[]
): Promise<DeviceImportSource> {
  const list = Array.from(files);
  const modelFile = list.find((f) => MODEL_EXT[fileExtension(f.name)]);
  if (!modelFile) {
    throw new Error("Поддерживаются файлы .obj, .fbx и .glb");
  }

  const type = MODEL_EXT[fileExtension(modelFile.name)]!;
  const mtlFile = list.find((f) => fileExtension(f.name) === "mtl");

  let resources: SceneImportResources | undefined;
  if (
    type === "OBJ" &&
    (mtlFile || list.some((f) => TEXTURE_EXT.test(f.name)))
  ) {
    resources = { textureFiles: {} };
    if (mtlFile) resources.mtlText = await mtlFile.text();
    for (const f of list) {
      if (TEXTURE_EXT.test(f.name)) {
        resources.textureFiles![f.name] = await f.arrayBuffer();
      }
    }
  }

  return { type, file: modelFile, resources };
}
