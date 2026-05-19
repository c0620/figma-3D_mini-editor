import type { TranslationKey, TranslationBundle } from "../i18n/en";
import { useSessionStore } from "../store/sessionStore";

export type Locale = "ru" | "en";

export class LocalizationService {
  private translations: Record<Locale, Partial<TranslationBundle>> = {
    ru: {},
    en: {},
  };

  get locale(): Locale {
    return useSessionStore.getState().locale;
  }

  setLocale(locale: Locale): void {
    useSessionStore.getState().setLocale(locale);
  }

  addBundle(locale: Locale, bundle: TranslationBundle): void {
    this.translations[locale] = { ...this.translations[locale], ...bundle };
  }

  t(key: TranslationKey): string {
    return this.translations[this.locale]?.[key] ?? key;
  }
}
