import { defineCollection, z } from 'astro:content';
import type { Loader, LoaderContext } from 'astro/loaders';
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

const TYPE_VALUES = [
  'EXPERIMENT',
  'PROTOTYPE',
  'TOOL',
  'CASE',
  'VISUAL_STUDY',
  'EDITORIAL',
] as const;

const STATUS_VALUES = ['LIVE', 'DEMO', 'STATIC', 'FROZEN', 'ARCHIVE'] as const;

const ART_DIRECTION_VALUES = [
  'MONOCHROME',
  'CHROMATIC',
  'MATERIAL',
  'ORGANIC',
] as const;

const CONTEXT_VALUES = ['ALTACO', 'EONYX', 'EXTERNAL', 'INTERNAL'] as const;

const DATA_MODE_VALUES = ['NONE', 'SYNTHETIC', 'SANITIZED', 'LIVE_BUSINESS'] as const;

export type WorkType = (typeof TYPE_VALUES)[number];
export type WorkStatus = (typeof STATUS_VALUES)[number];
export type ArtDirection = (typeof ART_DIRECTION_VALUES)[number];

// Локалізовані поля — по одному екземпляру на мову (модель, розділ 4a).
const localizedSchema = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Структурні поля — спільні для обох мов, не дублюються (розділ 4a).
// Дубльовані поля розходяться, і правило 5.1 виконується вибірково по мовах.
const structuralSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug має бути kebab-case'),
  type: z.enum(TYPE_VALUES),
  status: z.enum(STATUS_VALUES),
  art_direction: z.enum(ART_DIRECTION_VALUES),
  cover: z.string(),
  // published замінює year (рішення 019) — рік сам по собі не задає
  // порядку двох об'єктів того самого року. `year` для показу
  // виводиться з published у .transform() нижче.
  published: z.coerce.date(),
  context: z.enum(CONTEXT_VALUES).optional(),
  endpoint: z.string().url().optional(),
  owner: z.string().optional(),
  last_checked: z.coerce.date().optional(),
  source_repo: z.string().optional(),
  build_ref: z.string().optional(),
  data_mode: z.enum(DATA_MODE_VALUES),
  data_snapshot_date: z.coerce.date().optional(),
  data_fields: z.array(z.string()).optional(),
  media: z.array(z.string()).optional(),
  // Єдине ручне поле масштабу картки (розділ 4 брифу IA, рішення 021).
  // Решта масштабу виводиться з type/status — див. lib/validate.ts.
  feature: z.boolean().optional(),
});

const rawWorkSchema = structuralSchema.extend({
  translations: z.object({
    uk: localizedSchema.nullable(),
    en: localizedSchema.nullable(),
  }),
});

// Дві схеми (structural, localized), об'єднані в одну схему запису через
// .superRefine() — саме тут реалізовано правила збірки з розділу 5 моделі.
const workSchema = rawWorkSchema
  .superRefine((data, ctx) => {
    const { slug } = data;

    // 5.7 — обидва переклади обов'язкові.
    if (!data.translations.uk) {
      ctx.addIssue(`[5.7] ${slug}: бракує uk.md — переклад обов'язковий для обох мов, інакше перемикач мови веде в 404`);
    }
    if (!data.translations.en) {
      ctx.addIssue(`[5.7] ${slug}: бракує en.md — переклад обов'язковий для обох мов, інакше перемикач мови веде в 404`);
    }

    // 5.1 — бізнес-дані ніколи не бувають LIVE. Головне правило репозиторію:
    // технічний запис формули «Neurica не другий production-контур».
    if (data.data_mode === 'LIVE_BUSINESS') {
      ctx.addIssue(
        `[5.1] ${slug}: data_mode=LIVE_BUSINESS означає прямий доступ до бізнес-даних. ` +
        `Neurica — жива лабораторія, а не другий production-контур: щойно щось починає впливати ` +
        `на виручку, з'являється SLA, незалежно від того, що написано на картці. Стеля для ` +
        `комерційних даних — DEMO з data_mode=SANITIZED або SYNTHETIC.`
      );
    }
    if (data.context === 'ALTACO' && data.status === 'LIVE') {
      ctx.addIssue(
        `[5.1] ${slug}: context=ALTACO і status=LIVE. ALTACO — комерційний контур; LIVE тут означає, ` +
        `що збій на Neurica стає збоєм у бізнесі, якого ця поверхня не повинна нести. Знизьте status ` +
        `до DEMO — демо вбудовується артефактом (build_ref), а не з'єднується з живим сервісом.`
      );
    }

    // 5.2 — демо вбудовується, а не підключається.
    if ((data.status === 'LIVE' || data.status === 'DEMO') && data.endpoint && !data.build_ref) {
      ctx.addIssue(
        `[5.2] ${slug}: є endpoint без build_ref. Демонстраційна поверхня має бути артефактом, ` +
        `зібраним на конкретному коміті чужого репозиторію (build_ref), а не з'єднанням із працюючим ` +
        `сервісом — інакше вона розходиться з джерелом і падає разом із ним.`
      );
    }

    // 5.4 — обов'язковість полів за станом.
    if (data.status === 'LIVE' && !data.owner) {
      ctx.addIssue(`[5.4] ${slug}: status=LIVE вимагає owner — має бути відповідальний за працездатність.`);
    }
    if (data.status === 'DEMO' && data.data_mode === 'NONE' && data.endpoint) {
      ctx.addIssue(`[5.4] ${slug}: status=DEMO з endpoint не може мати data_mode=NONE — інтерактивна поверхня без даних суперечлива.`);
    }
    if (data.data_mode !== 'NONE' && data.data_mode !== 'SYNTHETIC' && !data.data_snapshot_date) {
      ctx.addIssue(`[5.4] ${slug}: data_mode=${data.data_mode} вимагає data_snapshot_date — видима дата знімає питання про свіжість без гарантій.`);
    }

    // Розділ 4 — body обов'язкове для CASE та EDITORIAL, окремо по кожній
    // наявній мові (мова, якої немає, уже впіймана правилом 5.7 вище).
    for (const lang of ['uk', 'en'] as const) {
      const t = data.translations[lang];
      if (t && (data.type === 'CASE' || data.type === 'EDITORIAL') && !t.body) {
        ctx.addIssue(`[4] ${slug}: type=${data.type} вимагає body в ${lang}.md`);
      }
    }
  })
  .transform((data) => {
    // 5.3 — LIVE понижується сам, якщо lastChecked старший за 45 днів.
    // Не помилка збірки: це downgrade, не fail.
    let status = data.status;
    if (status === 'LIVE' && data.last_checked) {
      const ageDays = (Date.now() - data.last_checked.getTime()) / 86_400_000;
      if (ageDays > 45) {
        console.warn(
          `[5.3] ${data.slug}: LIVE, last_checked ${Math.round(ageDays)} днів тому (> 45) → знижено до FROZEN на збірці`
        );
        status = 'FROZEN' as WorkStatus;
      }
    }
    // year виводиться з published — лише для показу, не окреме поле джерела.
    const year = data.published.getUTCFullYear();
    return { ...data, status, year };
  });

export type WorkEntry = z.infer<typeof workSchema>;

interface FrontmatterResult {
  data: Record<string, unknown>;
  body: string;
}

function parseFrontmatter(raw: string): FrontmatterResult {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    return { data: {}, body: raw.trim() };
  }
  const [, frontmatter, body] = match;
  const data = (loadYaml(frontmatter) as Record<string, unknown>) ?? {};
  return { data, body: body.trim() };
}

function readLocalized(dir: string, lang: 'uk' | 'en'): z.infer<typeof localizedSchema> | null {
  const filePath = path.join(dir, `${lang}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, body } = parseFrontmatter(raw);
  return {
    title: typeof data.title === 'string' ? data.title : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    body: body.length > 0 ? body : undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
  };
}

/**
 * Скановий loader для колекції `work`. Кожна піддиректорія
 * src/content/work/<slug>/ дає один запис: структурні поля з index.yaml
 * + локалізовані переклади з uk.md/en.md, об'єднані в один об'єкт і
 * прогнані крізь workSchema.superRefine() (правила розділу 5 моделі).
 */
function workLoader(baseDir: string): Loader {
  return {
    name: 'neurica-work-loader',
    load: async (context: LoaderContext) => {
      const { store, parseData, logger } = context;
      store.clear();

      if (!fs.existsSync(baseDir)) {
        logger.warn(`work collection directory not found: ${baseDir}`);
        return;
      }

      const slugs = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

      const featuredSlugs: string[] = [];

      for (const slug of slugs) {
        const dir = path.join(baseDir, slug);
        const indexPath = path.join(dir, 'index.yaml');
        if (!fs.existsSync(indexPath)) {
          logger.warn(`${slug}: бракує index.yaml, пропущено`);
          continue;
        }
        const structural = (loadYaml(fs.readFileSync(indexPath, 'utf-8')) as Record<string, unknown>) ?? {};

        const raw = {
          ...structural,
          slug,
          translations: {
            uk: readLocalized(dir, 'uk'),
            en: readLocalized(dir, 'en'),
          },
        };

        const parsed = await parseData({ id: slug, data: raw, filePath: indexPath });
        store.set({ id: slug, data: parsed });

        if ((parsed as { feature?: boolean }).feature) {
          featuredSlugs.push(slug);
        }
      }

      // Рішення 021 — feature максимум три одночасно. Попередження,
      // не fail: масштаб карток лишається виведеним, просто на
      // головній featured-об'єктів стане більше, ніж задумано.
      if (featuredSlugs.length > 3) {
        console.warn(
          `[feature] більше трьох featured-об'єктів (${featuredSlugs.length}): ${featuredSlugs.join(', ')} — задумано максимум 3`
        );
      }
    },
  };
}

const work = defineCollection({
  loader: workLoader(path.join(process.cwd(), 'src/content/work')),
  schema: workSchema,
});

export const collections = { work };
