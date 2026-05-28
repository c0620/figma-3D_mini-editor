/**
 * English translations — source of truth for all i18n keys.
 * The type of this object (`TranslationBundle`) is used to enforce
 * key parity across all locales.
 */
const en = {
  // --- Panel: scene graph ---
  "panel.scene.title": "Scene",
  "panel.scene.content": "Scene content",
  "panel.params.title": "Parameters",
  "panel.params.meshMaterials": "Mesh materials",
  "panel.params.materialParams": "Parameters {name}",
  "panel.params.materialTextures": "Textures {name}",
  "material.roughness": "Roughness",
  "material.metalness": "Gloss",
  "material.emissiveIntensity": "Emissive strength",
  "material.baseColor": "Base color",
  "material.baseColor.rgb": "RGB",
  "material.figmaVariable.placeholder": "Select a Figma variable",
  "material.figmaVariable.none": "No variable",
  "material.figmaVariable.empty": "No color variables in this file",
  "material.figmaVariable.unavailable": "Available only inside the Figma plugin",

  "texture.slot.BaseColor": "Base color",
  "texture.slot.Normal": "Normal map",
  "texture.slot.Roughness": "Roughness map",
  "texture.slot.Metalness": "Metalness map",
  "texture.slot.Emissive": "Emissive map",
  "texture.action.saveDevice": "Save to device",
  "texture.action.loadDevice": "Load from device",
  "texture.action.saveFigma": "Save to Figma frame",
  "texture.action.loadFigma": "Load from Figma frame",
  "texture.action.delete": "Remove texture",
  "texture.notify.saveFailed": "Could not download texture",
  "texture.notify.noLinkedFrame": "Select a linked render frame on the canvas",
  "texture.notify.figmaExportPending": "Export to Figma frame is not available yet",
  "texture.notify.figmaImportPending": "Import from Figma frame is not available yet",
  "texture.notify.figmaImportFailed": "Could not read texture from Figma",
  "panel.scene.addObject": "Add object",
  "panel.scene.addLight": "Add light",
  "panel.scene.editing": "Editing",
  "panel.scene.locked": "Object is locked — parameters unavailable",
  "input.projectName.placeholder": "Project name",

  // --- Transform groups ---
  "transform.position": "Position",
  "transform.rotation": "Rotation",
  "transform.scale": "Scale",

  // --- Scene entity labels ---
  "entity.mesh.default": "Mesh",
  "entity.light.directional": "Directional light",
  "entity.light.ambient": "Ambient light",
  "entity.light.spot": "Spotlight",
  "entity.light.hdri": "HDRI",
  "entity.camera.perspective": "Camera (perspective)",
  "entity.camera.orthographic": "Camera (orthographic)",

  // --- Camera params ---
  "camera.near": "Near",
  "camera.far": "Far",
  "camera.aspect": "Aspect",
  "camera.fov": "Field of view",
  "camera.fov.preset.fov15": "Wide (15 mm)",
  "camera.fov.preset.fov35": "Standard (35 mm)",
  "camera.fov.preset.fov50": "Normal (50 mm)",
  "camera.fov.preset.fov70": "Portrait (70 mm)",
  "camera.fov.preset.fov400": "Telephoto (400 mm)",
  "camera.aspect.width": "W",
  "camera.aspect.height": "H",
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

  "light.type.ambient": "Ambient",
  "light.type.spot": "Spot",
  "light.type.hdri": "HDRI",
  "light.intensity": "Intensity",
  "light.distance": "Distance",
  "light.penumbra": "Penumbra",
  "light.angle": "Angle",
  "light.target": "Target direction",
  "light.hdriPreset": "HDRI preset",
  "light.hdriPreset.studio": "Studio",
  "light.hdriPreset.sunset": "Sunset",
  "light.hdriPreset.warehouse": "Warehouse",

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

  // --- Asset library ---
  "library.title": "Asset library",
  "library.stats": "{count} assets across {tags} tags:",
  "library.filter.primitive": "Primitive",
  "library.filter.abstract": "Abstract shape",
  "library.filter.mockup": "Mockup",
  "library.addToScene": "Add to scene",
  "library.polygons": "Polygon count: {count}",
  "library.proceduralSize": "File size: —",
  "library.empty": "No assets in this category yet",
  "library.tag.primitive": "Primitive",
  "library.tag.abstract": "Abstract shape",
  "library.tag.mockup": "Mockup",
  "library.asset.box.name": "Box",
  "library.asset.sphere.name": "Sphere",
  "library.asset.cylinder.name": "Cylinder",
  "library.asset.cone.name": "Cone",
  "library.asset.torus.name": "Torus",
  "library.asset.plane.name": "Plane",
  "library.asset.icosahedron.name": "Icosahedron",
  "library.asset.torusKnot.name": "Torus knot",

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
  "help.title": "Help",
  "help.step.1": "Import a 3D model (GLB / FBX / OBJ)",
  "help.step.2": "Select an object in the scene graph or viewport",
  "help.step.3": "Edit transform, material, lighting",
  "help.step.4": "Export render to Figma or save to device",

  "help.nav.general": "Working with the plugin",
  "help.nav.general.settings": "Plugin settings",
  "help.nav.general.interface": "Plugin interface",
  "help.nav.general.renderLinked": "Render and linked render",
  "help.nav.export": "Exporting results",
  "help.nav.export.simple": "Simple render",
  "help.nav.export.linked": "Linked render",
  "help.nav.export.local": "Save to device",
  "help.nav.tools": "Tools",
  "help.nav.tools.meshes": "Meshes",
  "help.nav.tools.textures": "Textures",
  "help.nav.tools.lights": "Light sources",
  "help.nav.tools.camera": "Camera",
  "help.nav.shortcuts": "Keyboard shortcuts",

  "help.section.general.title": "Working with the plugin",
  "help.section.settings.title": "Plugin settings",
  "help.section.settings.item1": "Language: English and Russian are available",
  "help.section.settings.item2": "Switch between light and dark theme",
  "help.section.settings.item3": "Increase UI font size",
  "help.section.settings.item4": "Window size: 800×450 or 1600×900",
  "help.section.interface.title": "Plugin interface",
  "help.section.interface.body":
    "The workspace is divided into a 3D viewport, side panels, and toolbars. The scene graph lists all objects; the parameters panel shows properties of the selection.",
  "help.section.interface.intro": "The top bar controls the whole scene. Here you can:",
  "help.section.interface.action1": "Clear the scene",
  "help.section.interface.action2": "Change background color",
  "help.section.interface.action3": "Toggle shadows",
  "help.section.interface.action4": "Export render",
  "help.section.renderLinked.title": "Render and linked render",
  "help.section.renderLinked.body":
    "A simple render exports a PNG image to Figma or your device. A linked render also stores scene data in the Figma file so you can reopen and edit the scene later from the same frame.",
  "help.section.renderLinked.item1": "Name the project before exporting to Figma for linked updates",
  "help.section.renderLinked.item2": "Do not delete texture files exported with a linked render",

  "help.section.export.title": "Exporting results",
  "help.section.exportSimple.title": "Simple render",
  "help.section.exportSimple.body":
    "Export the current viewport as a PNG. Set resolution and transparency in the export dialog. Works for both Figma and local save when only the image is needed.",
  "help.section.exportLinked.title": "Linked render",
  "help.section.exportLinked.body":
    "Saves the render to a Figma frame together with scene metadata. Reopen the plugin from that frame to continue editing materials, lights, and camera without starting over.",
  "help.section.exportLocal.title": "Save to device",
  "help.section.exportLocal.body":
    "Download a PNG snapshot and/or a GLB scene file. GLB can include geometry, materials, and optionally separate texture files and camera settings.",

  "help.section.tools.title": "Tools",
  "help.section.toolMeshes.title": "Meshes",
  "help.section.toolMeshes.body":
    "Import GLB, FBX, or OBJ models from your device or the asset library. Select a mesh in the scene graph or viewport to edit transform, visibility, and materials.",
  "help.section.toolMeshes.item1": "Move, rotate, and scale with gizmo tools (G / R / S)",
  "help.section.toolMeshes.item2": "Adjust material color, metalness, and roughness in the parameters panel",
  "help.section.toolTextures.title": "Textures",
  "help.section.toolTextures.body":
    "Assign image textures to mesh materials. Pick files from disk or use textures embedded in imported models.",
  "help.section.toolLights.title": "Light sources",
  "help.section.toolLights.body":
    "Add ambient, spot, or HDRI lights from the scene panel. Tune intensity, color, and direction in the parameters panel when a light is selected.",
  "help.section.toolCamera.title": "Camera",
  "help.section.toolCamera.body":
    "Switch between perspective and orthographic modes. Use view presets, FOV, aspect ratio, and zoom. The aspect ratio affects export resolution.",

  "help.section.shortcuts.title": "Keyboard shortcuts",
  "help.section.shortcuts.intro": "Transform and editing shortcuts in the viewport:",

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
