import { defineCollection, z } from 'astro:content';
import type { Loader, LoaderContext } from 'astro/loaders';
import type { SchemaContext } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import sharp from 'sharp';

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

// Цільова пропорція обкладинки за напрямком (== --image-ratio у
// tokens.css). Дублювання ручне: CSS-токени й ця мапа мають лишатись
// синхронними, зв'язок задокументований у docs/07-content-spec.md §2.
const ART_DIRECTION_RATIOS: Record<ArtDirection, number> = {
  MONOCHROME: 4 / 3,
  CHROMATIC: 16 / 9,
  MATERIAL: 1,
  ORGANIC: 3 / 4,
};

// Розділ 4 брифу content-prep: орієнтовний ліміт символів для
// uk-заголовка на display-кеглі (desktop, ~2 рядки). Розрахунок —
// docs/07-content-spec.md §4. Warning, не fail.
const UK_TITLE_WARN_THRESHOLD = 30;

// 5.8 — заборона плейсхолдерів у endpoint/build_ref.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /example\.com/i,
  /localhost/i,
  /^<.*>$/,
  /\bTODO\b/i,
  /\bTBD\b/i,
];

function isPlaceholderValue(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value));
}

const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;

// «Тег» практично довільний у git — формально перевірити можна тільки
// що це не голий плейсхолдер і не порожній рядок із пробілами.
function isValidBuildRef(value: string): boolean {
  if (isPlaceholderValue(value)) return false;
  if (SHA_PATTERN.test(value)) return true;
  return /^\S+$/.test(value);
}

// Локалізовані поля — по одному екземпляру на мову (модель, розділ 4a).
// media — alt/caption за id, прив'язані до структурного media[] нижче.
const localizedMediaSchema = z.record(
  z.string(),
  z.object({
    alt: z.string(),
    caption: z.string().optional(),
  })
);

const localizedSchema = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
  media: localizedMediaSchema.optional(),
});

type LocalizedEntry = z.infer<typeof localizedSchema>;

function buildWorkSchema({ image }: SchemaContext) {
  // Структурні поля — спільні для обох мов, не дублюються (розділ 4a).
  // Дубльовані поля розходяться, і правило 5.1 виконується вибірково
  // по мовах. media[] — шлях структурний, alt/caption локалізовані
  // (розділ 3 content-prep брифу, рішення 024): те саме розділення,
  // що й для решти полів.
  const structuralSchema = z.object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug має бути kebab-case'),
    type: z.enum(TYPE_VALUES),
    status: z.enum(STATUS_VALUES),
    art_direction: z.enum(ART_DIRECTION_VALUES),
    cover: image(),
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
    media: z
      .array(
        z.object({
          id: z.string(),
          src: image(),
        })
      )
      .optional(),
    // Єдине ручне поле масштабу картки (розділ 4 IA-брифу, рішення 021).
    // Решта масштабу виводиться з type/status — див. lib/validate.ts.
    feature: z.boolean().optional(),
  });

  const rawWorkSchema = structuralSchema.extend({
    translations: z.object({
      uk: localizedSchema.nullable(),
      en: localizedSchema.nullable(),
    }),
  });

  // Дві схеми (structural, localized), об'єднані в одну схему запису
  // через .superRefine() — саме тут реалізовано правила розділу 5
  // моделі й нові правила content-prep брифу (5.8, media-id, попередження).
  return rawWorkSchema
    .superRefine((data, ctx) => {
      const { slug } = data;

      // 5.7 — обидва переклади обов'язкові.
      if (!data.translations.uk) {
        ctx.addIssue(`[5.7] ${slug}: бракує uk.md — переклад обов'язковий для обох мов, інакше перемикач мови веде в 404`);
      }
      if (!data.translations.en) {
        ctx.addIssue(`[5.7] ${slug}: бракує en.md — переклад обов'язковий для обох мов, інакше перемикач мови веде в 404`);
      }

      // 5.1 — бізнес-дані ніколи не бувають LIVE. Головне правило
      // репозиторію: технічний запис формули «Neurica не другий
      // production-контур».
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

      // 5.8 — заборона плейсхолдерів у endpoint/build_ref (content-prep
      // брифу, рішення 022). Саме той випадок, від якого RuntimeNotice
      // мав захищати: DEMO веде на неіснуючий домен.
      if (data.endpoint && isPlaceholderValue(data.endpoint)) {
        ctx.addIssue(`[5.8] ${slug}: endpoint "${data.endpoint}" виглядає як плейсхолдер — замінити на реальний перед публікацією або прибрати поле разом зі status`);
      }
      if (data.build_ref && !isValidBuildRef(data.build_ref)) {
        ctx.addIssue(`[5.8] ${slug}: build_ref "${data.build_ref}" не схожий на валідний SHA чи тег — замінити на реальний ідентифікатор коміту/тегу`);
      }

      // Розділ 4 моделі — body обов'язкове для CASE та EDITORIAL,
      // окремо по кожній наявній мові (мова, якої немає, уже впіймана
      // правилом 5.7 вище).
      for (const lang of ['uk', 'en'] as const) {
        const t: LocalizedEntry | null = data.translations[lang];
        if (t && (data.type === 'CASE' || data.type === 'EDITORIAL') && !t.body) {
          ctx.addIssue(`[4] ${slug}: type=${data.type} вимагає body в ${lang}.md`);
        }
      }

      // media[] — кожен id зі структурного файлу має alt в обох мовних
      // файлах (content-prep брифу, рішення 024). Той самий принцип,
      // що й 5.7, але на рівні окремого зображення, не всього об'єкта.
      const structuralMediaIds = (data.media ?? []).map((m) => m.id);
      for (const lang of ['uk', 'en'] as const) {
        const t: LocalizedEntry | null = data.translations[lang];
        if (!t) continue;
        const localizedIds = new Set(Object.keys(t.media ?? {}));
        for (const id of structuralMediaIds) {
          if (!localizedIds.has(id)) {
            ctx.addIssue(`[media] ${slug}: media id "${id}" немає alt у ${lang}.md`);
          }
        }
      }

      // Пропорція обкладинки проти art_direction (§2.2 content-prep
      // брифу) перевіряється в loader'і через sharp, не тут: image()
      // ще не резолвнув реальні width/height на етапі parseData —
      // це відбувається пізніше, під час vite-збірки асетів.

      // uk-заголовок проти орієнтовного ліміту display-кеглю (§4).
      const ukTitle = data.translations.uk?.title;
      if (ukTitle && ukTitle.length > UK_TITLE_WARN_THRESHOLD) {
        console.warn(
          `[title-length] ${slug}: заголовок uk "${ukTitle}" — ${ukTitle.length} символів, ` +
          `орієнтовний ліміт display ≈${UK_TITLE_WARN_THRESHOLD} (docs/07-content-spec.md §4). Не помилка — перенос можливий свідомо.`
        );
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
}

export type WorkEntry = z.infer<ReturnType<typeof buildWorkSchema>>;

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

function readLocalized(dir: string, lang: 'uk' | 'en'): Record<string, unknown> | null {
  const filePath = path.join(dir, `${lang}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, body } = parseFrontmatter(raw);
  return {
    title: typeof data.title === 'string' ? data.title : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    body: body.length > 0 ? body : undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
    media: data.media && typeof data.media === 'object' ? data.media : undefined,
  };
}

const PLACEHOLDER_FILENAME_PATTERN = /\.placeholder\./;

/**
 * Скановий loader для колекції `work`. Кожна піддиректорія
 * src/content/work/<slug>/ дає один запис: структурні поля з index.yaml
 * + локалізовані переклади з uk.md/en.md, об'єднані в один об'єкт і
 * прогнані крізь workSchema.superRefine() (правила розділу 5 моделі).
 * Заглушкові зображення (§2.3 content-prep брифу) перевіряються тут,
 * на сирих шляхах з index.yaml — до того, як image() перетворить їх
 * на оптимізований асет із хешем у назві.
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

        // Заглушки не мають ставати тихо (§2.3) — один warning на файл.
        if (typeof structural.cover === 'string' && PLACEHOLDER_FILENAME_PATTERN.test(structural.cover)) {
          console.warn(`[placeholder] ${slug}: cover "${structural.cover}" — заглушка, замінити перед публікацією`);
        }
        if (Array.isArray(structural.media)) {
          for (const item of structural.media) {
            const src = (item as { src?: unknown })?.src;
            if (typeof src === 'string' && PLACEHOLDER_FILENAME_PATTERN.test(src)) {
              console.warn(`[placeholder] ${slug}: media "${src}" — заглушка, замінити перед публікацією`);
            }
          }
        }

        // Пропорція обкладинки проти art_direction (§2.2 content-prep
        // брифу) — warning, не fail: кроп усе одно відбудеться. Читаємо
        // реальні пікселі через sharp напряму: на цьому етапі image()
        // ще не резолвнув width/height (це відбувається пізніше, в
        // vite-збірці асетів), а тут файл уже лежить на диску.
        if (typeof structural.cover === 'string' && typeof structural.art_direction === 'string') {
          const targetRatio = ART_DIRECTION_RATIOS[structural.art_direction as ArtDirection];
          const coverAbsPath = path.join(dir, structural.cover);
          if (targetRatio && fs.existsSync(coverAbsPath)) {
            try {
              const meta = await sharp(coverAbsPath).metadata();
              if (meta.width && meta.height) {
                const actualRatio = meta.width / meta.height;
                const deviation = Math.abs(actualRatio / targetRatio - 1);
                if (deviation > 0.15) {
                  console.warn(
                    `[image-ratio] ${slug}: cover ${meta.width}×${meta.height} (${actualRatio.toFixed(2)}:1) ` +
                    `відхиляється від ${structural.art_direction} (${targetRatio.toFixed(2)}:1) більш ніж на 15% — кроп відбудеться, перевірте композицію`
                  );
                }
              }
            } catch (err) {
              logger.warn(`${slug}: не вдалося прочитати метадані cover (${(err as Error).message})`);
            }
          }
        }

        const raw = {
          ...structural,
          slug,
          translations: {
            uk: readLocalized(dir, 'uk'),
            en: readLocalized(dir, 'en'),
          },
        };

        const parsed = await parseData({ id: slug, data: raw, filePath: indexPath });
        // filePath має бути відносним до кореня сайту (не абсолютним
        // OS-шляхом) — саме за ним image() пізніше знаходить асет під
        // час build, а не тільки під час sync-валідації схеми.
        store.set({ id: slug, data: parsed, filePath: path.relative(process.cwd(), indexPath) });

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
  schema: (context: SchemaContext) => buildWorkSchema(context),
});

export const collections = { work };
