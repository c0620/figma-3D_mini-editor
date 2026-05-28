import type { TranslationKey } from "@/i18n/en";
import { TextureSlot } from "@/types/scene";

export const TEXTURE_SLOT_LABEL_KEYS: Record<TextureSlot, TranslationKey> = {
  [TextureSlot.BaseColor]: "texture.slot.BaseColor",
  [TextureSlot.Normal]: "texture.slot.Normal",
  [TextureSlot.Roughness]: "texture.slot.Roughness",
  [TextureSlot.Metalness]: "texture.slot.Metalness",
  [TextureSlot.Emissive]: "texture.slot.Emissive",
};
