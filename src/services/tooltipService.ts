import type { TranslationKey } from '../i18n/en';
import type { TooltipData } from '../types/ui';
import { LocalizationService } from './localizationService';

export class TooltipService {
  enabled: boolean = true;
  i18n: LocalizationService;

  constructor(i18n: LocalizationService) {
    this.i18n = i18n;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getTooltip(toolId: string): TooltipData {
    const nameKey = `tooltip.${toolId}.name` as TranslationKey;
    const descKey = `tooltip.${toolId}.description` as TranslationKey;
    const shortcutKey = `tooltip.${toolId}.shortcut` as TranslationKey;
    return {
      toolId,
      name: this.i18n.t(nameKey),
      description: this.i18n.t(descKey),
      shortcut: this.i18n.t(shortcutKey),
    };
  }
}
