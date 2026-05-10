import type { TooltipData, ShortcutItem } from '../types/ui';
import { LocalizationService } from './localizationService';
import { TooltipService } from './tooltipService';

export class HelpService {
  i18n: LocalizationService;
  private tooltips: TooltipService;

  constructor(i18n: LocalizationService, tooltips: TooltipService) {
    this.i18n = i18n;
    this.tooltips = tooltips;
  }

  openHelpModal(): void {}

  getWorkflowSteps(): string[] {
    return [];
  }

  getToolsList(): TooltipData[] {
    if (!this.tooltips.enabled) return [];
    return [];
  }

  getShortcuts(): ShortcutItem[] {
    return [];
  }
}
