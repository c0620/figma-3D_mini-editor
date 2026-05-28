(() => {
  // plugin-src/code.ts
  var PLUGIN_DATA_KEY = "figma3d.meta";
  function respond(requestId, ok, payload, error) {
    figma.ui.postMessage({
      type: "figma-response",
      requestId,
      ok,
      payload,
      error
    });
  }
  function parseLinkedMeta(raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.kind !== "linked-render" || parsed.version !== 1) {
        return null;
      }
      return parsed;
    } catch (_e) {
      return null;
    }
  }
  function readLinkedSelectionFromPage() {
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
      projectName: meta.projectName
    };
  }
  function pushLinkedSelectionUpdate() {
    figma.ui.postMessage({
      type: "linked-selection-update",
      frame: readLinkedSelectionFromPage()
    });
  }
  async function handleExportRenderFrame(msg) {
    const frame = figma.createFrame();
    frame.name = msg.name;
    frame.resize(msg.width, msg.height);
    const image = figma.createImage(new Uint8Array(msg.pngBytes));
    frame.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: image.hash
      }
    ];
    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
    if (msg.linked) {
      const meta = {
        version: 1,
        kind: "linked-render",
        sceneId: msg.linked.sceneId,
        projectName: msg.linked.projectName
      };
      frame.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(meta));
      await figma.clientStorage.setAsync(
        `figma3d:scene:${msg.linked.sceneId}`,
        JSON.stringify({
          glbBase64: msg.linked.glbBase64,
          camera: msg.linked.camera,
          projectName: msg.linked.projectName,
          exportedAt: Date.now()
        })
      );
    }
    respond(msg.requestId, true, { frameId: frame.id });
    pushLinkedSelectionUpdate();
  }
  function handleFindLinkedFrames(msg) {
    const frames = [];
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
  function handleGetLinkedSelection(msg) {
    respond(msg.requestId, true, { frame: readLinkedSelectionFromPage() });
  }
  async function handleRestoreLinkedScene(msg) {
    const node = figma.getNodeById(msg.frameId);
    if (!node || node.type !== "FRAME") {
      throw new Error("\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0443\u0437\u0435\u043B \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0444\u0440\u0435\u0439\u043C\u043E\u043C");
    }
    const raw = node.getPluginData(PLUGIN_DATA_KEY);
    if (!raw) {
      throw new Error("\u0424\u0440\u0435\u0439\u043C \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0433\u043E \u0440\u0435\u043D\u0434\u0435\u0440\u0430");
    }
    const meta = parseLinkedMeta(raw);
    if (!meta) {
      throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043C\u0435\u0442\u0430\u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0433\u043E \u0440\u0435\u043D\u0434\u0435\u0440\u0430");
    }
    const stored = await figma.clientStorage.getAsync(
      `figma3d:scene:${meta.sceneId}`
    );
    if (!stored) {
      throw new Error("\u0414\u0430\u043D\u043D\u044B\u0435 \u0441\u0446\u0435\u043D\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B \u0432 clientStorage");
    }
    const payload = JSON.parse(stored);
    if (!payload.glbBase64) {
      throw new Error("GLB \u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0446\u0435\u043D\u044B \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442");
    }
    respond(msg.requestId, true, {
      sceneId: meta.sceneId,
      projectName: payload.projectName || meta.projectName,
      camera: payload.camera,
      glbBase64: payload.glbBase64,
      frameName: node.name
    });
  }
  function rgbaChannelToByte(channel) {
    return Math.round(Math.min(255, Math.max(0, channel * 255)));
  }
  function rgbaToHex(color) {
    const r = rgbaChannelToByte(color.r);
    const g = rgbaChannelToByte(color.g);
    const b = rgbaChannelToByte(color.b);
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
  }
  async function resolveColorVariableHex(variableId) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable || variable.resolvedType !== "COLOR") {
      throw new Error("\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0438\u043B\u0438 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0446\u0432\u0435\u0442\u043E\u043C");
    }
    const collection = await figma.variables.getVariableCollectionByIdAsync(
      variable.variableCollectionId
    );
    if (!collection) {
      throw new Error("\u041A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044F \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430");
    }
    const modeId = collection.defaultModeId;
    const value = variable.valuesByMode[modeId];
    if (!value || typeof value !== "object" || !("r" in value)) {
      throw new Error("\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0446\u0432\u0435\u0442\u0430 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0440\u0435\u0436\u0438\u043C\u0430");
    }
    return rgbaToHex(value);
  }
  async function handleListColorVariables(msg) {
    var _a;
    const variables = await figma.variables.getLocalVariablesAsync("COLOR");
    const collectionNames = /* @__PURE__ */ new Map();
    const summaries = [];
    for (const variable of variables) {
      let collectionName = collectionNames.get(variable.variableCollectionId);
      if (!collectionName) {
        const collection = await figma.variables.getVariableCollectionByIdAsync(
          variable.variableCollectionId
        );
        collectionName = (_a = collection == null ? void 0 : collection.name) != null ? _a : "Collection";
        collectionNames.set(variable.variableCollectionId, collectionName);
      }
      summaries.push({
        id: variable.id,
        name: variable.name,
        collectionName
      });
    }
    respond(msg.requestId, true, { variables: summaries });
  }
  async function handleResolveColorVariable(msg) {
    const hex = await resolveColorVariableHex(msg.variableId);
    respond(msg.requestId, true, { hex });
  }
  function pushVariablesChanged() {
    figma.ui.postMessage({ type: "variables-changed" });
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
              case "list-color-variables":
                await handleListColorVariables(msg);
                break;
              case "resolve-color-variable":
                await handleResolveColorVariable(msg);
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
                void 0,
                error instanceof Error ? error.message : String(error)
              );
            } else {
              figma.notify(`Plugin error: ${error}`);
            }
          }
        };
        figma.on("selectionchange", pushLinkedSelectionUpdate);
        figma.variables.on("change", pushVariablesChanged);
        break;
    }
    figma.showUI(__html__, uiOptions);
    figma.ui.resize(uiOptions.width, uiOptions.height);
    pushLinkedSelectionUpdate();
  } catch (error) {
    figma.notify(`An error occurred while executing task: ${error}`);
  }
})();
