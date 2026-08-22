# neurica.net

Публічна експериментальна поверхня EONYX: прототипи, live demo,
візуальні дослідження, кейси. Жива лабораторія, не другий
production-контур — деталі в [`docs/00-what-neurica-is.md`](./docs/00-what-neurica-is.md).

## Як запустити

```bash
npm install
npm run dev       # локальний сервер розробки
npm run build     # статична збірка в dist/
npm run preview   # переглянути dist/ локально
```

Потрібен Node з `.nvmrc` (LTS).

## Як додати об'єкт

Коротко: `src/content/work/<slug>/` з `index.yaml` (структурні поля)
і обов'язковими `uk.md` + `en.md` (переклади). Збірка падає з
поясненням, якщо порушено одне з правил моделі контенту.

Повна інструкція — [`docs/03-publishing.md`](./docs/03-publishing.md),
локалізація — [`docs/03a-localisation.md`](./docs/03a-localisation.md).

## Документація

- [`docs/00-what-neurica-is.md`](./docs/00-what-neurica-is.md) —
  функція, три поверхні EONYX, жорстка межа
- [`docs/01-content-model.md`](./docs/01-content-model.md) — модель
  контенту v0.1 (джерело істини)
- [`docs/02-design-system.md`](./docs/02-design-system.md) —
  дизайн-токени, invariant/directional
- [`docs/03-publishing.md`](./docs/03-publishing.md) — публікація
  об'єкта
- [`docs/03a-localisation.md`](./docs/03a-localisation.md) —
  локалізація
- [`docs/04-architecture.md`](./docs/04-architecture.md) — стек,
  збірка, Netlify
- [`docs/05-decisions.md`](./docs/05-decisions.md) — журнал рішень

## Ліцензія

Всі права захищені © 2026 EONYX
