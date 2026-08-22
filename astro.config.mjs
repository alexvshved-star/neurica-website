import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { load as loadYaml } from 'js-yaml';

// Sitemap не повинен містити ARCHIVE-об'єкти (доступні лише за прямим
// посиланням, зі стрічки й індексу прибрані — рішення 018) ані
// фікстури порушень (src/_fixtures/ поза колекцією й так ніколи сюди
// не потрапляють). Читаємо index.yaml напряму, а не через
// content.config.ts — конфіг збірки виконується до Content Layer.
function getArchiveSlugs() {
  const workDir = path.join(process.cwd(), 'src/content/work');
  if (!fs.existsSync(workDir)) return [];
  return fs
    .readdirSync(workDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => {
      const indexPath = path.join(workDir, slug, 'index.yaml');
      if (!fs.existsSync(indexPath)) return false;
      const data = loadYaml(fs.readFileSync(indexPath, 'utf-8'));
      return data?.status === 'ARCHIVE';
    });
}

const archiveSlugs = getArchiveSlugs();

// /dev/type (розділ 7 typography-брифу) — інструмент розробки, не
// публічна сторінка. `output: 'static'` пререндерить усі маршрути на
// build незалежно від import.meta.env.DEV — сторінка все одно
// повернула б 404-Response у розмітці, але dist/dev/type/index.html
// фізично лишився б файлом. Прибираємо його явно після build, тож
// «маршруту не існує» виконується буквально, не тільки за кодом
// статусу.
function stripDevPagesIntegration() {
  return {
    name: 'strip-dev-pages',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const devDir = new URL('dev/', dir);
        fs.rmSync(devDir, { recursive: true, force: true });
      },
    },
  };
}

export default defineConfig({
  site: 'https://neurica.net',
  i18n: {
    defaultLocale: 'uk',
    locales: ['uk', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (url) =>
        !archiveSlugs.some((slug) => url.includes(`/work/${slug}/`)) && !url.includes('/dev/'),
    }),
    stripDevPagesIntegration(),
  ],
});
