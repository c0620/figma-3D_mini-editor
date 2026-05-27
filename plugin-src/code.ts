const PLUGIN_DATA_KEY = "figma3d.meta";

interface LinkedRenderMeta {
  version: 1;
  kind: "linked-render";
  sceneId: string;
  projectName: string;
}

interface LinkedSelectionSummary {
  frameId: string;
  frameName: string;
  sceneId: string;
  projectName: string;
}

function respond(
  requestId: string,
  ok: boolean,
  payload?: unknown,
  error?: string
): void {
  figma.ui.postMessage({
    type: "figma-response",
    requestId,
    ok,
    payload,
    error,
  });
}

function parseLinkedMeta(raw: string): LinkedRenderMeta | null {
  try {
    const parsed = JSON.parse(raw) as LinkedRenderMeta;
    if (!parsed || parsed.kind !== "linked-render" || parsed.version !== 1) {
      return null;
    }
    return parsed;
  } catch (_e) {
    return null;
  }
}

function readLinkedSelectionFromPage(): LinkedSelectionSummary | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1 || selection[0].type !== "FRAME") {
    return null;
  }

  const frame = selection[0];
  const raw = frame.getPluginData(PLUGIN_DATA_KEY);
  if (!raw) return null;

  const meta = parseLinkedMeta(raw);
  if (!meta) return null;

  return {
    frameId: frame.id,
    frameName: frame.name,
    sceneId: meta.sceneId,
    projectName: meta.projectName,
  };
}

function pushLinkedSelectionUpdate(): void {
  figma.ui.postMessage({
    type: "linked-selection-update",
    frame: readLinkedSelectionFromPage(),
  });
}

async function handleExportRenderFrame(msg: {
  requestId: string;
  name: string;
  width: number;
  height: number;
  pngBytes: number[];
  linked?: {
    sceneId: string;
    projectName: string;
    glbBase64: string;
    camera: unknown;
  };
}): Promise<void> {
  const frame = figma.createFrame();
  frame.name = msg.name;
  frame.resize(msg.width, msg.height);

  const image = figma.createImage(new Uint8Array(msg.pngBytes));
  frame.fills = [
    {
      type: "IMAGE",
      scaleMode: "FILL",
      imageHash: image.hash,
    },
  ];

  figma.currentPage.appendChild(frame);
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);

  if (msg.linked) {
    const meta: LinkedRenderMeta = {
      version: 1,
      kind: "linked-render",
      sceneId: msg.linked.sceneId,
      projectName: msg.linked.projectName,
    };
    frame.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(meta));

    await figma.clientStorage.setAsync(
      `figma3d:scene:${msg.linked.sceneId}`,
      JSON.stringify({
        glbBase64: msg.linked.glbBase64,
        camera: msg.linked.camera,
        projectName: msg.linked.projectName,
        exportedAt: Date.now(),
      })
    );
  }

  respond(msg.requestId, true, { frameId: frame.id });
  pushLinkedSelectionUpdate();
}

function handleFindLinkedFrames(msg: {
  requestId: string;
  sceneId: string;
  projectName: string;
}): void {
  const frames: { id: string; name: string }[] = [];

  for (const node of figma.currentPage.findAll((n) => n.type === "FRAME")) {
    const raw = node.getPluginData(PLUGIN_DATA_KEY);
    if (!raw) continue;

    const meta = parseLinkedMeta(raw);
    if (!meta) continue;
    if (meta.sceneId !== msg.sceneId) continue;
    if (msg.projectName && meta.projectName !== msg.projectName) continue;

    frames.push({ id: node.id, name: node.name });
  }

  respond(msg.requestId, true, { frames });
}

function handleGetLinkedSelection(msg: { requestId: string }): void {
  respond(msg.requestId, true, { frame: readLinkedSelectionFromPage() });
}

async function handleRestoreLinkedScene(msg: {
  requestId: string;
  frameId: string;
}): Promise<void> {
  const node = figma.getNodeById(msg.frameId);
  if (!node || node.type !== "FRAME") {
    throw new Error("Выбранный узел не является фреймом");
  }

  const raw = node.getPluginData(PLUGIN_DATA_KEY);
  if (!raw) {
    throw new Error("Фрейм не содержит связанного рендера");
  }

  const meta = parseLinkedMeta(raw);
  if (!meta) {
    throw new Error("Некорректные метаданные связанного рендера");
  }

  const stored = await figma.clientStorage.getAsync(
    `figma3d:scene:${meta.sceneId}`
  );
  if (!stored) {
    throw new Error("Данные сцены не найдены в clientStorage");
  }

  const payload = JSON.parse(stored) as {
    glbBase64: string;
    camera: unknown;
    projectName: string;
  };

  if (!payload.glbBase64) {
    throw new Error("GLB данные сцены отсутствуют");
  }

  respond(msg.requestId, true, {
    sceneId: meta.sceneId,
    projectName: payload.projectName || meta.projectName,
    camera: payload.camera,
    glbBase64: payload.glbBase64,
    frameName: node.name,
  });
}

try {
  const uiOptions = { height: 900, title: "", width: 1600 };
  switch (figma.editorType) {
    case "figma":
      uiOptions.title = "3D: mini-editor";

      figma.ui.onmessage = async (msg) => {
        try {
          switch (msg.type) {
            case "export-render-frame":
              await handleExportRenderFrame(msg);
              break;
            case "find-linked-frames":
              handleFindLinkedFrames(msg);
              break;
            case "get-linked-selection":
              handleGetLinkedSelection(msg);
              break;
            case "restore-linked-scene":
              await handleRestoreLinkedScene(msg);
              break;
            case "cancel":
              figma.closePlugin();
              break;
            default:
              break;
          }
        } catch (error) {
          if (msg.requestId) {
            respond(
              msg.requestId,
              false,
              undefined,
              error instanceof Error ? error.message : String(error)
            );
          } else {
            figma.notify(`Plugin error: ${error}`);
          }
        }
      };

      figma.on("selectionchange", pushLinkedSelectionUpdate);
      break;
  }

  figma.showUI(__html__, uiOptions);
  figma.ui.resize(uiOptions.width, uiOptions.height);
  pushLinkedSelectionUpdate();
} catch (error) {
  figma.notify(`An error occurred while executing task: ${error}`);
}
