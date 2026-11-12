// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import {
  FigmaAPITypes,
  type FigmaAPIAnswers,
  PluginDataKeys,
  type PluginNodeData,
  type UIRequests,
} from "./types";

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

const PLUGIN_NAMESPACE = "figma-3D-mini-editor";

function getPluginNodeData(node: SceneNode): PluginNodeData {
  return Object.fromEntries([
    Object.values(PluginDataKeys),
    Object.values(PluginDataKeys).map((k) => node.getPluginData(k)),
  ]);
}

async function processUIRequest(
  message: UIRequests[FigmaAPITypes]
): Promise<FigmaAPIAnswers[FigmaAPITypes]> {
  switch (message.type) {
    case FigmaAPITypes.placeRender: {
      const frame = message.frameID
        ? await figma.getNodeByIdAsync(message.frameID)
        : figma.createFrame();
      if (frame?.type !== "FRAME")
        throw new Error(
          `processUIRequest.placeRender(figma backend): get ${frame?.type} instead of frame`
        );
      frame.resize(message.size.width, message.size.height);
      frame.name = message.name;
      Object.entries(message.nodeData).forEach(([value, key]) =>
        frame.setPluginData(key, value)
      );
      const image = figma.createImage(message.imageBytes);
      frame.fills = [
        { type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" },
      ];
      return { id: message.id, type: message.type, frameID: frame.id };
    }

    case FigmaAPITypes.closePlugin: {
      figma.closePlugin();
      return { id: message.id, type: message.type };
    }
    case FigmaAPITypes.createFrame: {
      const frame = figma.createFrame();
      frame.resize(message.width, message.height);
      frame.name = message.name;
      return { id: message.id, type: message.type, frameID: frame.id };
    }
    case FigmaAPITypes.findPluginFrames: {
      const nodes = figma.currentPage
        .findAllWithCriteria({
          pluginData: { keys: ["sceneID"] }, //does it returns all plugin nodes or no one? (plugin node has at least 2 keys)
        })
        .filter((node) => {
          const data = getPluginNodeData(node);
          if (data.sceneID !== message.sceneID) return;
          if (!message.options?.linkedOnly) {
            return data.scene !== "";
          }
          if (!message.options?.plainOnly) {
            return data.scene === "";
          }
        })
        .map((node) => ({
          nodeID: node.id,
          ...getPluginNodeData(node),
        }));
      return { id: message.id, type: message.type, nodes };
    }
    case FigmaAPITypes.setPluginData: {
      const node = figma.currentPage
        .findAllWithCriteria({ pluginData: {} })
        .find((node) => node.id === message.nodeID);
      if (!node)
        throw new Error(
          "setPluginData (Figma backend): page has not node with such id"
        );
      node.setPluginData(message.key, message.value);
      return { id: message.id, type: message.type, nodeID: node.id };
    }
    case FigmaAPITypes.getPluginData: {
      const node = figma.currentPage.findOne(
        (node) => node.id == message.nodeID
      );

      if (!node)
        throw new Error(
          "getPluginData (Figma backend): page has not node with such id"
        );

      const data: Record<string, string> = {};
      message.keys.forEach((k) => {
        data[k] = node.getPluginData(k);
      });
      return { id: message.id, type: message.type, data, nodeID: node.id };
    }
    case FigmaAPITypes.insertImage: {
      const image = figma.createImage(message.bytes);
      message.frame.fills = [
        { type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" },
      ];
      return { id: message.id, type: message.type };
    }
  }
}

try {
  const uiOptions = { height: 900, title: "", width: 1600 };
  switch (figma.editorType) {
    case "figma":
      uiOptions.title = "3D: mini-editor";
      figma.notify("Running in Figma Plugin environment");

      figma.ui.onmessage = (request) =>
        processUIRequest(request).then((msg) => figma.ui.postMessage(msg));

      break;
  }

  figma.showUI(__html__, uiOptions);
  figma.ui.resize(uiOptions.width, uiOptions.height);
} catch (error) {
  figma.notify(`An error occurred while executing task: ${error}`);
}
