# ALTACO Site Audit Report

**Об'єкт аудиту:** https://altaco.shop/ (магазин на /shop/)
**Хостинг:** Hosting Ukraine (за словами власника)
**Дата:** 2026-05-08
**Аудитор:** Claude (Neurica), READ-ONLY режим
**Гілка:** `claude/altaco-site-audit-fasOW`

---

## 0. Доступи до середовища аудиту (важливо прочитати першим)

Цей звіт виконано з ізольованого середовища Claude Code на стороні Neurica.
**Реального доступу до інфраструктури сайту ALTACO у мене немає.** Конкретно:

| Канал доступу | Статус | Наслідок |
|---|---|---|
| SSH / shell на Hosting Ukraine | **No access** | Не можу читати `error_log`, `wp-config.php`, права файлів, директорії |
| cPanel / hPanel Hosting Ukraine | **No access** | Не бачу версію PHP, MySQL, ліміти памʼяті, бекапи |
| wp-admin / WP-CLI | **No access** | Не можу перерахувати плагіни, теми, версії, .po/.mo |
| MySQL / phpMyAdmin | **No access** | Не можу перевірити структуру БД, атрибути товарів, options |
| FTP / SFTP | **No access** | Не бачу файли теми, child-theme, override-шаблони |
| Прямий HTTP до altaco.shop з sandbox | **Заблоковано** | Всі `curl` та `WebFetch` повертають 403 (host_not_allowed на рівні sandbox) — публічний remote-аудит з цього середовища також неможливий |
| WebSearch (Google snippets) | **Доступно, обмежено** | Видає тільки заголовки/URL з індексу пошуковика |

**Висновок щодо обсягу:** все нижче, що позначено `[VERIFIED — WebSearch]`, є реальною знахідкою з пошукового індексу. Все, що позначено `[ймовірно]` — гіпотеза на основі цих обмежених сигналів. Все, що позначено `[No access / not verified]` — не перевірено через відсутність доступу. **Жодних вигадок я не додаю.**

Щоб виконати повний обсяг ТЗ DISCOVER (логи, версії, плагіни, БД, шаблони, .po/.mo), мені потрібен один із доступів:
1. SSH-доступ до акаунта на Hosting Ukraine (read-only sudo не потрібен), або
2. Тимчасовий обліковий запис WP Administrator + дозвіл WP-CLI через cPanel Terminal, або
3. Файли сайту у вигляді архіву (`wp-content/`, `wp-config.php` без секретів, дамп БД) надіслані окремо.

---

## 1. Executive Summary

На основі **публічно видимих сигналів** (заголовки сторінок і структура URL з Google-індексу) сайт має такі симптоми:

- **Систематичне змішування мов:** заголовок головної сторінки магазину російською («Онлайн склад натурального камня…»), товарні заголовки російською з англійськими назвами товарів («Мрамор CALACATTA CERVAIOLE — купить сляб мрамора…»), URL-слаги транслітом російською (`/mramor/`), категорії частково англійською (`/kitchen-selection/`). [VERIFIED — WebSearch]
- **Невідповідність очікуванню «український e-commerce»** — для українського ринку та .shop-домену основна мова контенту виглядає російською, інтерфейсні елементи (зі слів власника) ще й англійські та українські — це класичний симптом «накладених шарів» без єдиної locale-стратегії.

**Чи краще ремонтувати чи переробляти?** На цьому етапі — **рекомендація обережна, фінальну дам після отримання доступу.** Попередньо: якщо діагноз підтвердиться (старий WP + перевантажена тема + накладені перекладацькі плагіни + забруднені атрибути товарів), **варіант C** (тимчасовий cleanup старого + паралельна побудова нового каталогу) майже завжди дешевший і швидший за «реанімацію» старого Woo-стора з накопиченим технічним боргом. Але це треба підтвердити логами і даними БД, а не інтуїцією.

---

## 2. Environment

| Параметр | Значення | Джерело |
|---|---|---|
| CMS | [ймовірно] WordPress + WooCommerce | Структура URL `/shop/`, `/product-category/`-style сегменти, заголовки виду «купить сляб … в Украине» — конвенційні для WooCommerce-тем. **Не верифіковано** через відсутність доступу до HTML/REST/wp-json |
| WordPress version | [No access / not verified] | Потрібен `wp core version` або HTML `<meta generator>` чи `/readme.html` |
| WooCommerce version | [No access / not verified] | Потрібен `wp plugin get woocommerce --field=version` або файл `wp-content/plugins/woocommerce/woocommerce.php` |
| PHP version | [No access / not verified] | Потрібен cPanel → Select PHP Version, або `php -v` по SSH, або заголовок `X-Powered-By` (часто прихований) |
| MySQL / MariaDB | [No access / not verified] | Потрібен cPanel → MySQL Databases, або `SELECT VERSION();` |
| Активна тема | [No access / not verified] | Потрібен `wp theme list --status=active` або шлях `/wp-content/themes/<slug>/` у DOM |
| Child theme | [No access / not verified] | Те саме |
| Активні плагіни | [No access / not verified] | Потрібен `wp plugin list --status=active` або enqueued-сигнатури з HTML |
| Структура файлів сайту | [No access / not verified] | Потрібен `ls -la public_html/` |
| Основна директорія | [ймовірно] `~/public_html/` (стандарт Hosting Ukraine для основного домену) | Конвенція хостера, не перевірено |

**Все важливе тут — `[No access / not verified]`. Без середовища це не аудит, це здогадки.**

---

## 3. Critical Issues

> Список нижче — поточні **підозри**, які треба підтвердити після доступу. Немає сенсу називати «критичним» те, чого я не бачив на власні очі.

### 3.1 Мовний хаос у контенті (підтверджено WebSearch)
- Title `/shop/`: «Онлайн склад натурального камня: гранит, мрамор, кварцит, оникс» — **російська**.
- Title товару: «Мрамор CALACATTA CERVAIOLE — купить сляб мрамора CALACATTA CERVAIOLE в Украине» — **російська + англ. назва**.
- URL-слаги: `/mramor/calacatta-cervaiole/`, `/mramor/giallo-siena/`, `/kitchen-selection/moonrock/` — **росіянізм + англіцизм** в одній структурі. Зі слів власника, інтерфейс містить і українські, і англійські рядки («All products», «Close», «Load more products», «Отображение») — це чотиришарова мовна суміш.
- **Бізнес-вплив:** падіння довіри українського покупця, ризик алгоритмічних санкцій локального SEO, переплутані hreflang, неконсистентні title/description.

### 3.2 Дублікати у фільтрі кольорів (зі слів власника, не верифіковано)
- **Найімовірніша причина:** одне і те ж значення атрибута WooCommerce створене двічі — російською і українською (або з пробілом/без, з різним регістром). У `wp_terms` тоді існують два `term_id` з різним slug, але візуально однакові. Це **не баг теми**, це **забруднені дані**.
- Для перевірки потрібен SQL: `SELECT t.term_id, t.name, t.slug, tt.taxonomy FROM wp_terms t JOIN wp_term_taxonomy tt ON tt.term_id=t.term_id WHERE tt.taxonomy LIKE 'pa_color%' OR tt.taxonomy LIKE 'pa_цвет%' ORDER BY t.name;`

### 3.3 Hardcoded UI-рядки у темі (зі слів власника)
- Рядки «All products», «Close», «Load more products», «Отображение» — **підозра на hardcoded text** у файлах теми (не через `__()` / `_e()`), бо інакше WP-locale `uk_UA` чи `ru_RU` мав би їх перекласти. Можливі джерела:
  - `wp-content/themes/<theme>/woocommerce/` — override-шаблони з англ./рос. рядками без gettext;
  - `wp-content/themes/<theme>/inc/` — функції з прямими echo;
  - окремий «AJAX load more» плагін зі своїм текстом без локалізації.
- **Без доступу до `wp-content/themes/`** не можу підтвердити.

### 3.4 Можлива застарілість WP / PHP / плагінів
- Дуже типово для проєктів, які «зробили один раз і забули», особливо на Hosting Ukraine з ручним керуванням оновленнями. **No access / not verified.**

---

## 4. UX / Content Issues

| Симптом | Статус | Коментар |
|---|---|---|
| Змішування UA / RU / EN на сторінці | [VERIFIED — WebSearch (RU+EN)], [user-reported (UA)] | Див. 3.1 |
| Дублікати кольорів у фільтрі | [user-reported, not verified] | Див. 3.2 |
| CTA «Load more products», «Отображение», «Close», «All products» — англ./рос. на українському магазині | [user-reported, not verified] | Див. 3.3 |
| Картки товарів | [No access / not verified] | Потрібен HTML сторінки `/shop/` |
| Структура заголовків товарних сторінок (повторюється «купить сляб … купить сляб …») | [VERIFIED — WebSearch] | Title «Мрамор X — купить сляб мрамора X в Украине» — **дублювання ключа** в одному title, шаблон SEO-плагіна або теми написано неправильно |
| Hreflang | [No access / not verified] | |
| Мобільний UX | [No access / not verified] | |

---

## 5. WooCommerce Issues

> Все, що нижче — **гіпотези**, які треба підтвердити доступом до `wp-content/themes/<theme>/woocommerce/` та таблиць `wp_posts`, `wp_postmeta`, `wp_terms`, `wp_term_taxonomy`, `wp_term_relationships`.

- **Кастомні шаблони WooCommerce у темі:** [No access / not verified]. Перевірити через `ls wp-content/themes/<active-theme>/woocommerce/` — кожен файл там переоприділяє стандартний template.
- **Застарілі override-файли:** [No access / not verified]. WooCommerce у консолі сам сигналізує «Outdated templates» в `WooCommerce → Status`. Без wp-admin не побачу.
- **Конфлікт теми та WooCommerce:** [No access / not verified].
- **Порожні атрибути товарів** (зі слів власника): найімовірніше — атрибути `pa_color`, `pa_stone-type`, `pa_brand`, `pa_thickness`, `pa_size`, `pa_stock`, `pa_price` створені, але **не привʼязані до товарів** через `wp_term_relationships`. Тобто шаблон їх рендерить, а в БД для конкретного товару значень немає. Можна підтвердити запитом до БД.
- **Ціна як атрибут (`pa_price`)** — **антипатерн**. Ціна повинна бути полем `_regular_price`/`_sale_price`, а не таксономією. Якщо `pa_price` справді існує — це ще одна причина переробляти каталог, а не «лагодити».
- **Експорт товарів у CSV:** [feasible, not yet attempted]. Стандартний шлях — WooCommerce → Products → Export або плагін `Product Import Export for WooCommerce`. Без wp-admin не зроблю; рекомендація — після доступу витягнути CSV для нового каталогу.

---

## 6. SEO Issues

| Перевірка | Результат | Коментар |
|---|---|---|
| `robots.txt` | [No access / not verified] | Sandbox блокує. Власник або сам показує файл, або я тягну після виходу з sandbox |
| `sitemap.xml` | [No access / not verified] | Те саме |
| Canonical URLs | [No access / not verified] | |
| Meta title | [partial — VERIFIED] | На рівні title бачу шаблон «Тип Назва — купить сляб … в Украине» з **дублюванням ключа** і **російською мовою** — це шаблон Yoast/RankMath/SEOPress або теми, треба переписати |
| Meta description | [No access / not verified] | |
| Категорії | [No access / not verified] | |
| Сторінки товарів | [partial — VERIFIED] | URL чисті (`/mramor/<slug>/`, `/kitchen-selection/<slug>/`), але слаги — росіянізм/англіцизм |
| Індексація після Load More | [No access / not verified] | Якщо «Load more» — чистий JS-fetch без зміни URL (без `?paged=2`), товари після першої порції **не індексуються** взагалі. Це поширений баг AJAX-каталогів |
| Пагінація | [No access / not verified] | |
| Дублі через фільтри | [No access / not verified] | Класичний шкідник у Woo: фасетні фільтри генерують `?filter_color=…&filter_size=…` URL, всі індексуються — Google бачить тисячі майже-однакових сторінок |
| Product Schema (JSON-LD) | [No access / not verified] | |
| Помилки schema | [No access / not verified] | |

---

## 7. Performance Issues

Все нижче — **No access / not verified**. Без HTML/headers/Lighthouse-прогону з реального з'єднання я не можу їх виміряти. Після доступу треба:
- Lighthouse / PageSpeed Insights на `/shop/` і на одному товарі;
- WebPageTest waterfall;
- перевірити `Cache-Control`, `Server`, `X-Cache` у відповідях;
- перевірити розміри JPG/PNG (часто на каталогах каменю — оригінальні 4–8 MB файли без resize);
- перевірити, чи активний WP Rocket / W3 Total Cache / LiteSpeed Cache;
- перевірити `srcset` і `loading="lazy"`;
- кількість товарів на одну сторінку каталогу.

---

## 8. Security Risks

Все — **No access / not verified**. Що треба перевірити після доступу:
- `wp core version` vs остання стабільна;
- `wp plugin list` — кожен плагін на актуальність і CVE (WPScan DB);
- `wp-content/plugins/` — наявність нульованих/торрент-плагінів (інколи видно по дивному author або відсутньому `readme.txt`);
- `public_html/` на наявність `.zip`, `.sql`, `.tar.gz`, `backup-*`, `wp-config.php.bak`;
- права файлів: каталоги 755, файли 644, `wp-config.php` 600/640;
- `wp-config.php`: `define('WP_DEBUG', false)`, `define('WP_DEBUG_DISPLAY', false)`, `define('DISALLOW_FILE_EDIT', true)`;
- `xmlrpc.php` — закритий чи ні;
- `/wp-admin/` — двофакторка, обмеження по IP чи basic-auth;
- `/wp-content/uploads/` — чи не виконуються там PHP-файли;
- HTTPS, HSTS, security headers (`X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `Referrer-Policy`).

---

## 9. Root Cause Analysis

> Гіпотези, виставлені у порядку ймовірності. Всі потребують підтвердження доступом.

1. **Тема (ймовірно купна, не оновлена кілька років).** Hardcoded рядки англійською + рос. fallbacks + власні WooCommerce override шаблони → причина мовної каші, кривих CTA, дивних title-шаблонів.
2. **Дані товарів (забруднені).** Атрибути створювалися ad-hoc, без єдиного списку значень → дублікати кольорів, порожні поля для більшості товарів, можливо `pa_price` як таксономія.
3. **Перекладацький плагін накладений зверху** (Loco Translate / WPML / Polylang / TranslatePress — невідомо який). Часткові переклади теми/Woo, але hardcoded рядки в темі він не бере → **залишки англ./рос. на UA-сторінці**.
4. **WooCommerce template override застарів.** Тема override-ить `content-product.php`, `loop/orderby.php` тощо зі старої версії Woo → ламається UX і скрипти, Woo пише «Outdated templates» у Status.
5. **SEO-плагін (Yoast/RankMath) із російським шаблоном title** від попереднього адміна → весь сайт у russophone-title-ах, навіть якщо контент змішаний.
6. **Хостинг.** Якщо PHP < 8.0, MySQL < 5.7 — частина сучасних плагінів падатиме у warnings/notices. Hosting Ukraine за замовчуванням не змушує оновлюватись. **No access / not verified.**
7. **Стара архітектура.** Сайт виглядає як «зробили один раз, додавали товари вручну, ніхто не вів контент-операції».

---

## 10. Recommended Fix Plan

### Quick fixes (1–2 дні), коли отримаємо доступ
- Зняти повний бекап (файли + БД) перед будь-чим. Power-rule.
- Зайти у `WooCommerce → Status` — зробити скріни всіх warnings (outdated templates, missing pages, log writes).
- Експортувати товари у CSV (Woo → Products → Export, обрати всі поля).
- Витягти список плагінів і їх версії (`wp plugin list --format=csv` або UI).
- Зробити dump таблиць `wp_terms`, `wp_term_taxonomy`, `wp_termmeta` — це вихідний матеріал для чистки фільтрів.
- Прочитати `wp-content/debug.log`, `error_log` у `public_html/` і `public_html/wp-content/`. Зберегти останні 1000 рядків.
- Зафіксувати JSON-LD Product schema на 5 товарах (чи валідне взагалі).

### Medium fixes (1 тиждень), якщо вибираємо «лагодити»
- Об'єднати дублікати атрибутів через WooCommerce → Products → Attributes (merge term-ів і перепривʼязати товари).
- Налаштувати єдиний WP-locale (`uk_UA`) як основний; перекласти hardcoded-рядки теми через child-theme override + Loco Translate; видалити «фасадний» переклад-плагін, якщо він конфліктує.
- Переглянути Yoast/RankMath title-template; перевести шаблони на українську; виправити дублювання ключа у title.
- Включити `loading="lazy"` (нативний WP вже додає, перевірити що тема не override-ить), стиснути зображення (Imagify/ShortPixel/EWWW), додати WebP.
- Налаштувати кеш (LiteSpeed Cache, якщо хостинг на LiteSpeed; інакше WP Super Cache).
- Заблокувати індексацію фасетних фільтрів через `noindex` або disallow у robots.txt — після підтвердження що це справді створює дублі.
- Оновити WP / Woo / плагіни **після staging-тесту**, не на production.

### Rebuild recommendation (якщо діагноз підтверджує тех-борг)
**Чесна відповідь:** для каталогу природного каменю з мультимовністю та нормальними фільтрами я б серйозно розглянув **новий каталог з нуля**:
- сучасна тема (Storefront/Blocksy/Woodmart/Astra Pro або Headless на Next.js + Woo REST/Store API);
- єдина taxonomy-стратегія (один список значень для color, stone-type, finish, thickness, size);
- ціна — поле, не атрибут;
- мультимовність через WPML або Polylang Pro з хорошими URL-слагами `/uk/`, `/en/` з правильним hreflang;
- картки з нормальною Lighthouse-оцінкою;
- імпорт даних товарів з CSV, очищених у Google Sheets / OpenRefine.

Бюджет «лагодити» зазвичай ~60–80% бюджету «переробити» при 2× гіршому результаті — на проєктах такого розміру.

---

## 11. Do Not Touch Without Approval

Жодне з нижченаведеного не робити без **окремого письмового підтвердження** від власника:

- Не оновлювати ядро WordPress.
- Не оновлювати WooCommerce.
- Не оновлювати плагіни (особливо платні з ліцензіями — можуть не активуватись).
- Не змінювати активну тему.
- Не змінювати child-theme файли.
- Не змінювати `wp-config.php`.
- Не змінювати PHP-версію через cPanel.
- Не запускати `WooCommerce → Status → Tools → Update database`, `Regenerate`, `Clear` — будь-що з тієї панелі.
- Не запускати плагіни «one-click optimize / repair / cleanup» (WP-Optimize, WP Reset, etc.).
- Не торкатись DNS у домена .shop.
- Не редагувати `.htaccess`.
- Не видаляти `wp-content/uploads/` навіть «зайве».
- Не вмикати/вимикати плагіни.
- Не запускати міграцію БД.
- Не вмикати `WP_DEBUG = true` на production. Якщо потрібен debug — тільки `WP_DEBUG_LOG = true` + `WP_DEBUG_DISPLAY = false`, після підтвердження.
- Не видаляти і не перейменовувати атрибути / терми (це може зламати привʼязки товарів).

---

## 12. Next Step

**Чітка рекомендація:** **варіант C** — *тимчасовий cleanup старого + паралельна побудова нового каталогу*.

Чому не A («ремонтувати поточний WooCommerce»):
- надто багато сигналів про накопичений тех-борг (мовна каша, забруднені атрибути, hardcoded UI, ймовірні застарілі override-шаблони);
- ремонт на живому продакшені з реальними замовленнями ризикований і обмежує темп;
- кожна виправлена проблема може зачепити іншу.

Чому не B («робити новий каталог» одразу і ламати старий):
- старий сайт зараз генерує трафік і замовлення; ламати його до моменту, поки новий не готовий — пряма втрата виручки.

**План на найближчі дні:**
1. Власник надає мені **один** з трьох доступів (SSH / WP Admin+cPanel / архів файлів + dump БД).
2. Я виконую повний DISCOVER-аудит з реальними версіями, логами і списком плагінів (~1 день).
3. Власник схвалює перелік `Quick fixes`, я їх виконую на staging-копії (не на проді).
4. Паралельно проєктуємо новий каталог: дані-модель, мовна стратегія, тема/headless, імпорт CSV.
5. Перемикаємо домен на новий каталог тільки після прийомки.

---

## Appendix A. Що саме я перевіряв і чого не зміг

**Що працювало:** WebSearch (Google snippets) — повертає назви сторінок, URL-структуру, фрагменти title.

**Що було заблоковано sandbox-ом:**
- `curl -I https://altaco.shop/` → `403, x-deny-reason: host_not_allowed`
- `curl https://altaco.shop/robots.txt` → `Host not in allowlist`
- `curl https://altaco.shop/sitemap.xml` → те саме
- `curl https://altaco.shop/wp-json/` → те саме
- `WebFetch https://altaco.shop/shop/` → `HTTP 403 Forbidden`
- `WebFetch https://altaco.shop/wp-login.php` → `HTTP 403 Forbidden`
- `WebFetch https://altaco.shop/readme.html` → `HTTP 403 Forbidden`
- `WebFetch https://builtwith.com/altaco.shop` → `HTTP 403 Forbidden`
- `WebFetch https://w3techs.com/sites/info/altaco.shop` → `HTTP 403 Forbidden`
- `WebFetch https://www.google.com/search?q=site:altaco.shop` → `HTTP 403 Forbidden`

**Реальні дані з WebSearch (verbatim):**
- Title `/shop/`: «Онлайн склад натурального камня: гранит, мрамор, кварцит, оникс»
- Title `/mramor/calacatta-cervaiole/`: «Мрамор CALACATTA CERVAIOLE — купить сляб мрамора CALACATTA CERVAIOLE в Украине»
- Title `/mramor/giallo-siena/`: «Мрамор GIALLO SIENA — купить сляб мрамора GIALLO SIENA в Украине»
- Title `/kitchen-selection/moonrock/`: «купить сляб кварцита MOONROCK в Украине — altaco stone»
- URL у видачі — `http://altaco.shop/...` (Google показав HTTP, не HTTPS — треба перевірити, чи коректний редирект 301 з http на https; якщо ні — це окрема SEO-помилка).

---

## Appendix B. Чек-лист доступу для повного DISCOVER

Що мені потрібно від власника, щоб довести цей звіт до повного обсягу ТЗ:

- [ ] SSH-логін на Hosting Ukraine (host, user, port, ключ або пароль)
- [ ] АБО WP Administrator + cPanel логін
- [ ] АБО архів `public_html/` + dump БД (без секретів у `wp-config.php`)
- [ ] Дозвіл читати `error_log`, `wp-content/debug.log`
- [ ] Дозвіл виконати `wp core version`, `wp plugin list`, `wp theme list`, `wp option get template`, `wp transient delete --expired` (тільки read; нічого не міняти)
- [ ] Підтвердження що staging-копія дозволена (інакше всі правки тільки після окремого затвердження на проді)

Коли отримаю — оновлю цей файл і повторно закомічу у ту ж гілку `claude/altaco-site-audit-fasOW`.
