type Locale = 'ru' | 'en';

export class LocalizationService {
  locale: Locale = 'en';
  private translations: Record<Locale, Record<string, string>> = { ru: {}, en: {} };

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  t(key: string): string {
    return this.translations[this.locale][key] ?? key;
  }
}
