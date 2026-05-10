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
    return {
      toolId,
      name: this.i18n.t(`tooltip.${toolId}.name`),
      description: this.i18n.t(`tooltip.${toolId}.description`),
      shortcut: this.i18n.t(`tooltip.${toolId}.shortcut`),
    };
  }
}
