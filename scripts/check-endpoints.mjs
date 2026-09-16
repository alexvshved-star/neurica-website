#!/usr/bin/env node
// Перевірка доступності endpoint для LIVE/DEMO об'єктів (§1.3
// content-prep брифу, рішення 023). Окремий, не блокуючий крок CI:
// зовнішній збій не повинен зупиняти збірку сайту, але має бути
// видимим — інакше перше, хто це помітить, перший відвідувач.
//
// Читає index.yaml напряму (той самий прийом, що astro.config.mjs),
// не через content.config.ts — цей скрипт запускається окремо від
// збірки Astro.

import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

const TIMEOUT_MS = 10_000;
const workDir = path.join(process.cwd(), 'src/content/work');

function collectTargets() {
  if (!fs.existsSync(workDir)) return [];
  const targets = [];
  for (const slug of fs.readdirSync(workDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)) {
    const indexPath = path.join(workDir, slug, 'index.yaml');
    if (!fs.existsSync(indexPath)) continue;
    const data = loadYaml(fs.readFileSync(indexPath, 'utf-8'));
    if (!data) continue;
    if ((data.status === 'LIVE' || data.status === 'DEMO') && data.endpoint) {
      targets.push({ slug, status: data.status, endpoint: data.endpoint });
    }
  }
  return targets;
}

async function checkOne({ slug, status, endpoint }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(endpoint, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(endpoint, { method: 'GET', signal: controller.signal, redirect: 'follow' });
    }
    clearTimeout(timer);
    const ok = res.status >= 200 && res.status < 300;
    console.log(`${ok ? '✓' : '⚠'} ${slug} (${status}) ${endpoint} -> ${res.status}`);
    return ok;
  } catch (err) {
    clearTimeout(timer);
    console.log(`⚠ ${slug} (${status}) ${endpoint} -> ${err.name === 'AbortError' ? 'timeout' : err.message}`);
    return false;
  }
}

const targets = collectTargets();

if (targets.length === 0) {
  console.log('Немає об\'єктів зі status LIVE/DEMO і endpoint — нічого перевіряти.');
  process.exit(0);
}

const results = await Promise.all(targets.map(checkOne));
const failed = results.filter((ok) => !ok).length;

if (failed > 0) {
  console.log(`\n${failed} з ${targets.length} endpoint(ів) не відповіли 2xx. Не блокує збірку — крок CI має continue-on-error.`);
  process.exit(1);
}

console.log(`\nУсі ${targets.length} endpoint(и) відповіли 2xx.`);
