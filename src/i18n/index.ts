import uk from './uk.json';
import en from './en.json';

export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';

type Dictionary = Record<string, string>;
const dictionaries: Record<Locale, Dictionary> = { uk, en };

/**
 * Брендовий дескриптор — англійський в обох мовах (підпис бренду,
 * не текст сторінки), тому свідомо поза словниками i18n.
 */
export const brandDescriptor = 'AI experiments, prototypes and selected work by EONYX';

/**
 * Підпис бренду під знаком у шапці й підвалі — англійський в обох
 * мовах, з тієї самої причини, і веде на eonyx.net. Разом рівно два
 * виходи на EONYX на сайт (розділ 5 IA-брифу) — жодного іншого місця
 * з посиланням на eonyx.net бути не повинно.
 *
 * "EONYX" рендериться як inline-SVG wordmark (BrandMark), не текст —
 * byLabel/eonyxLabel лишаються рядками для видимого "by" і для
 * прихованого (.sr-only) текстового еквіваленту знака.
 */
export const byLabel = 'by';
export const eonyxLabel = 'EONYX';
export const eonyxUrl = 'https://eonyx.net';

export function getLocale(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'uk';
}

export function t(locale: Locale, key: string): string {
  const value = dictionaries[locale][key];
  if (value === undefined) {
    throw new Error(`i18n: відсутній ключ "${key}" для локалі "${locale}"`);
  }
  return value;
}

/**
 * Перемикач мови веде на еквівалентну сторінку, не на головну.
 * Слаг спільний, різниця лише в префіксі /en/. Правило 5.7 гарантує
 * обидва переклади для об'єктів колекції, тому запасний варіант
 * (fallback на 404 чи головну) тут не потрібен.
 */
export function getAlternate(pathname: string, targetLocale: Locale): string {
  const stripped = pathname.replace(/^\/en(\/|$)/, '/');
  if (targetLocale === 'uk') {
    return stripped;
  }
  return stripped === '/' ? '/en/' : `/en${stripped}`;
}
