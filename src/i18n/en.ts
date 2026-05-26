/**
 * English translations — source of truth for all i18n keys.
 * The type of this object (`TranslationBundle`) is used to enforce
 * key parity across all locales.
 */
const en = {
  // --- Panel: scene graph ---
  "panel.scene.addObject": "Add object",
  "panel.scene.addLight": "Add light",
  "panel.scene.editing": "Editing",
  "panel.scene.locked": "Object is locked — parameters unavailable",

  // --- Transform groups ---
  "transform.position": "Position",
  "transform.rotation": "Rotation",
  "transform.scale": "Scale",

  // --- Scene entity labels ---
  "entity.mesh.default": "Mesh",
  "entity.light.directional": "Directional light",
  "entity.light.ambient": "Ambient light",
  "entity.light.hdri": "HDRI",
  "entity.camera.perspective": "Camera (perspective)",
  "entity.camera.orthographic": "Camera (orthographic)",

  // --- Camera params ---
  "camera.near": "Near",
  "camera.far": "Far",
  "camera.aspect": "Aspect",
  "camera.fov": "FOV",
  "camera.zoom": "Zoom",
  "camera.type.perspective": "Perspective",
  "camera.type.orthographic": "Orthographic",
  "camera.aspectPreview": "Aspect preview",
  "camera.aspectPreview.on": "Preview on",
  "camera.aspectPreview.off": "Preview off",
  "camera.presets": "View presets",
  "camera.preset.front": "Front",
  "camera.preset.back": "Back",
  "camera.preset.top": "Top",
  "camera.preset.bottom": "Bottom",
  "camera.preset.left": "Left",
  "camera.preset.right": "Right",
  "camera.preset.saved": "Saved",
  "camera.preset.saveCurrent": "Save current view",

  // --- Notifications ---
  "notify.scene.imported": "Scene imported",
  "notify.scene.exported": "Scene exported",
  "notify.scene.exportFigma": "Scene saved as linked render",
  "notify.error.import": "Failed to import scene",
  "notify.error.export": "Failed to export scene",
  "notify.error.generic": "An error occurred",

  // --- Screens ---
  "screen.start.title": "3D Scene Editor",
  "screen.start.newScene": "New scene",
  "screen.start.loadScene": "Load scene",
  "screen.load.title": "Choose file",
  "screen.load.supportedFormats": "Supported formats: GLB, FBX, OBJ",
  "screen.editor.title": "Editor",

  // --- Tooltips ---
  "tooltip.move.name": "Move",
  "tooltip.move.description": "Move object along XYZ axes",
  "tooltip.move.shortcut": "G",
  "tooltip.rotate.name": "Rotate",
  "tooltip.rotate.description": "Rotate object around axes",
  "tooltip.rotate.shortcut": "R",
  "tooltip.scale.name": "Scale",
  "tooltip.scale.description": "Scale object uniformly or per axis",
  "tooltip.scale.shortcut": "S",
  "tooltip.delete.name": "Delete",
  "tooltip.delete.description": "Remove selected object from the scene",
  "tooltip.delete.shortcut": "Del",

  // --- Help ---
  "help.step.1": "Import a 3D model (GLB / FBX / OBJ)",
  "help.step.2": "Select an object in the scene graph or viewport",
  "help.step.3": "Edit transform, material, lighting",
  "help.step.4": "Export render to Figma or save to device",

  // --- Common ---
  "common.undo": "Undo",
  "common.redo": "Redo",
  "common.cancel": "Cancel",
  "common.apply": "Apply",
  "common.close": "Close",
  "common.save": "Save",
  "common.delete": "Delete",
} as const;

export type TranslationKey = keyof typeof en;
/** Все локали обязаны иметь те же ключи; значения — произвольные строки. */
export type TranslationBundle = Record<TranslationKey, string>;

export default en satisfies TranslationBundle;
