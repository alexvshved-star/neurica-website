import type { WorkEntry } from '@/content.config';

/**
 * Правило 5.5 — статус показується тільки коли щось означає.
 * STATIC не рендериться: для VISUAL_STUDY/EDITORIAL/CASE, де це
 * значення за замовчуванням, "· STATIC" — шум.
 */
export function renderableStatus(status: WorkEntry['status']): WorkEntry['status'] | null {
  return status === 'STATIC' ? null : status;
}

/**
 * Сторінки-списки (стрічка, індекс) не показують ARCHIVE — воно
 * доступне лише за прямим посиланням і на /archive. FROZEN лишається
 * скрізь нарівні з рештою (рішення 018): відключене демо — це досі
 * добрий кейс, не привід зникнути зі стрічки.
 */
export function excludeArchive(items: WorkEntry[]): WorkEntry[] {
  return items.filter((item) => item.status !== 'ARCHIVE');
}

/**
 * /archive — тільки ARCHIVE (рішення 018). FROZEN туди не потрапляє:
 * «сторінка живе далі» (правило 5.3) означає лишитися в /work, а не
 * переїхати в архів.
 */
export function archiveOnly(items: WorkEntry[]): WorkEntry[] {
  return items.filter((item) => item.status === 'ARCHIVE');
}

export function sortByPublishedDesc(items: WorkEntry[]): WorkEntry[] {
  return [...items].sort((a, b) => b.published.getTime() - a.published.getTime());
}

/**
 * Головна — кураторський зріз, не повний перелік: об'єкти з
 * feature=true плюс найсвіжіші за published, разом не більше восьми,
 * фінально впорядковані хронологічно (стрічка, не групування
 * "спершу featured"). ARCHIVE вже відфільтрований на вході.
 */
export function selectHomeFeed(items: WorkEntry[], limit = 8): WorkEntry[] {
  const featured = items.filter((item) => item.feature);
  const rest = sortByPublishedDesc(items.filter((item) => !item.feature));
  const fillCount = Math.max(0, limit - featured.length);
  const selected = [...featured, ...rest.slice(0, fillCount)];
  return sortByPublishedDesc(selected);
}

export type CardScale = 'large' | 'medium' | 'small';

/**
 * Масштаб картки виводиться, не задається вручну (розділ 4 IA,
 * рішення 021): feature → large, інтерактивні (LIVE/DEMO) → medium,
 * решта → small. `feature` — єдине ручне поле.
 */
export function cardScale(entry: WorkEntry): CardScale {
  if (entry.feature) return 'large';
  if (entry.status === 'LIVE' || entry.status === 'DEMO') return 'medium';
  return 'small';
}

/**
 * Правило 5.6 — чергування арт-дирекшенів у стрічці. Правило верстки,
 * не заборона: три сусідні картки з однаковим art_direction означають,
 * що стрічка читається як один напрямок, тобто система — як його
 * відсутність. Виводить warning на збірці, не падає.
 */
export function warnArtDirectionRepeats(items: WorkEntry[], context: string): void {
  for (let i = 0; i + 2 < items.length; i++) {
    const [a, b, c] = [items[i], items[i + 1], items[i + 2]];
    if (a.art_direction === b.art_direction && b.art_direction === c.art_direction) {
      console.warn(
        `[5.6] ${context}: ${a.slug}, ${b.slug}, ${c.slug} — три сусідні картки з art_direction=${a.art_direction}, стрічка втрачає чергування`
      );
    }
  }
}
