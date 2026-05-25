(() => {
  // plugin-src/code.ts
  try {
    const uiOptions = { height: 900, title: "", width: 1600 };
    switch (figma.editorType) {
      case "figma":
        uiOptions.title = "3D: mini-editor";
        figma.notify("Running in Figma Plugin environment");
        figma.ui.onmessage = (msg) => {
          if (msg.type === "create-rectangles") {
            const nodes = [];
            for (let i = 0; i < msg.count; i++) {
              const rect = figma.createRectangle();
              rect.x = i * 150;
              rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
              figma.currentPage.appendChild(rect);
              nodes.push(rect);
            }
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
          }
          if (msg.type === "cancel") {
            figma.closePlugin();
          }
        };
        break;
    }
    figma.showUI(__html__, uiOptions);
    figma.ui.resize(uiOptions.width, uiOptions.height);
  } catch (error) {
    figma.notify(`An error occurred while executing task: ${error}`);
  }
})();
