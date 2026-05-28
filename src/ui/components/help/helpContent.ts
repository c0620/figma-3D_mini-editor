import type { TranslationKey } from "@/i18n/en";

import langIcon from "@/assets/images/icons/state/langRu.svg";
import themeIcon from "@/assets/images/icons/state/themeD.svg";
import fontIcon from "@/assets/images/icons/state/fontSizeL.svg";
import windowIcon from "@/assets/images/icons/state/windowSizeL.svg";
import garbageIcon from "@/assets/images/icons/descriptive/garbage.svg";
import bgIcon from "@/assets/images/icons/state/bgOn.svg";
import shadowsIcon from "@/assets/images/icons/state/shadowsOn.svg";
import renderIcon from "@/assets/images/icons/descriptive/render.svg";
import frameIcon from "@/assets/images/icons/descriptive/frame.svg";
import fileIcon from "@/assets/images/icons/descriptive/file.svg";
import meshIcon from "@/assets/images/icons/descriptive/mesh.svg";

export type HelpFeature = {
  icon: string;
  textKey: TranslationKey;
};

export type HelpSectionContent = {
  id: string;
  groupTitleKey?: TranslationKey;
  titleKey: TranslationKey;
  bodyKey?: TranslationKey;
  introKey?: TranslationKey;
  features?: HelpFeature[];
  actions?: HelpFeature[];
};

export const HELP_SECTIONS: HelpSectionContent[] = [
  {
    id: "settings",
    groupTitleKey: "help.section.general.title",
    titleKey: "help.section.settings.title",
    features: [
      { icon: langIcon, textKey: "help.section.settings.item1" },
      { icon: themeIcon, textKey: "help.section.settings.item2" },
      { icon: fontIcon, textKey: "help.section.settings.item3" },
      { icon: windowIcon, textKey: "help.section.settings.item4" },
    ],
  },
  {
    id: "interface",
    titleKey: "help.section.interface.title",
    bodyKey: "help.section.interface.body",
    introKey: "help.section.interface.intro",
    actions: [
      { icon: garbageIcon, textKey: "help.section.interface.action1" },
      { icon: bgIcon, textKey: "help.section.interface.action2" },
      { icon: shadowsIcon, textKey: "help.section.interface.action3" },
      { icon: renderIcon, textKey: "help.section.interface.action4" },
    ],
  },
  {
    id: "render-linked",
    titleKey: "help.section.renderLinked.title",
    bodyKey: "help.section.renderLinked.body",
    features: [
      { icon: frameIcon, textKey: "help.section.renderLinked.item1" },
      { icon: fileIcon, textKey: "help.section.renderLinked.item2" },
    ],
  },
  {
    id: "export-simple",
    groupTitleKey: "help.section.export.title",
    titleKey: "help.section.exportSimple.title",
    bodyKey: "help.section.exportSimple.body",
  },
  {
    id: "export-linked",
    titleKey: "help.section.exportLinked.title",
    bodyKey: "help.section.exportLinked.body",
  },
  {
    id: "export-local",
    titleKey: "help.section.exportLocal.title",
    bodyKey: "help.section.exportLocal.body",
  },
  {
    id: "tool-meshes",
    groupTitleKey: "help.section.tools.title",
    titleKey: "help.section.toolMeshes.title",
    bodyKey: "help.section.toolMeshes.body",
    features: [
      { icon: meshIcon, textKey: "help.section.toolMeshes.item1" },
      { icon: meshIcon, textKey: "help.section.toolMeshes.item2" },
    ],
  },
  {
    id: "tool-textures",
    titleKey: "help.section.toolTextures.title",
    bodyKey: "help.section.toolTextures.body",
  },
  {
    id: "tool-lights",
    titleKey: "help.section.toolLights.title",
    bodyKey: "help.section.toolLights.body",
  },
  {
    id: "tool-camera",
    titleKey: "help.section.toolCamera.title",
    bodyKey: "help.section.toolCamera.body",
  },
  {
    id: "shortcuts",
    titleKey: "help.section.shortcuts.title",
    introKey: "help.section.shortcuts.intro",
  },
];

export const HELP_SHORTCUTS: {
  nameKey: TranslationKey;
  descKey: TranslationKey;
  shortcutKey: TranslationKey;
}[] = [
  {
    nameKey: "tooltip.move.name",
    descKey: "tooltip.move.description",
    shortcutKey: "tooltip.move.shortcut",
  },
  {
    nameKey: "tooltip.rotate.name",
    descKey: "tooltip.rotate.description",
    shortcutKey: "tooltip.rotate.shortcut",
  },
  {
    nameKey: "tooltip.scale.name",
    descKey: "tooltip.scale.description",
    shortcutKey: "tooltip.scale.shortcut",
  },
  {
    nameKey: "tooltip.delete.name",
    descKey: "tooltip.delete.description",
    shortcutKey: "tooltip.delete.shortcut",
  },
];
