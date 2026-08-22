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
 * Правило 5.4/5.7 — сторінки-списки не показують ARCHIVE окрім
 * /archive. Використовується головною і /work.
 */
export function excludeArchive(items: WorkEntry[]): WorkEntry[] {
  return items.filter((item) => item.status !== 'ARCHIVE');
}

/**
 * /archive — тільки ARCHIVE і FROZEN.
 */
export function archiveOnly(items: WorkEntry[]): WorkEntry[] {
  return items.filter((item) => item.status === 'ARCHIVE' || item.status === 'FROZEN');
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
