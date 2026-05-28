import type { TranslationKey } from "@/i18n/en";

export type HelpNavItem = {
  id: string;
  labelKey: TranslationKey;
};

export type HelpNavGroup = {
  labelKey: TranslationKey;
  items: HelpNavItem[];
};

export const HELP_NAV_GROUPS: HelpNavGroup[] = [
  {
    labelKey: "help.nav.general",
    items: [
      { id: "settings", labelKey: "help.nav.general.settings" },
      { id: "interface", labelKey: "help.nav.general.interface" },
      { id: "render-linked", labelKey: "help.nav.general.renderLinked" },
    ],
  },
  {
    labelKey: "help.nav.export",
    items: [
      { id: "export-simple", labelKey: "help.nav.export.simple" },
      { id: "export-linked", labelKey: "help.nav.export.linked" },
      { id: "export-local", labelKey: "help.nav.export.local" },
    ],
  },
  {
    labelKey: "help.nav.tools",
    items: [
      { id: "tool-meshes", labelKey: "help.nav.tools.meshes" },
      { id: "tool-textures", labelKey: "help.nav.tools.textures" },
      { id: "tool-lights", labelKey: "help.nav.tools.lights" },
      { id: "tool-camera", labelKey: "help.nav.tools.camera" },
    ],
  },
  {
    labelKey: "help.nav.shortcuts",
    items: [{ id: "shortcuts", labelKey: "help.nav.shortcuts" }],
  },
];

export function helpSectionId(id: string): string {
  return `help-${id}`;
}
