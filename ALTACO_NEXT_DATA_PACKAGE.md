# ALTACO — Next Data Package

**Документ:** перелік даних і доступів, потрібних для переходу від публічного аудиту симптомів до **реального технічного DISCOVER**.
**Гілка:** `claude/altaco-site-audit-fasOW` (та сама, нової не створюємо).
**Режим:** READ-ONLY. Жодних змін на сайті, жодних паролів у чаті.
**Дата:** 2026-05-08.

---

## 0. Важливе уточнення про природу обмеження доступу

Те, що `curl` і `WebFetch` з мого середовища повертали `403 / host_not_allowed`, — це **обмеження sandbox-у Claude** (allowlist хостів на стороні мого виконавчого середовища). Це **не** захист від `adm.tools`, не WAF Hosting Ukraine, і не поведінка сайту altaco.shop проти звичайних відвідувачів. Звичайний користувач і звичайний браузер сайт відкривають нормально. Тому в попередньому звіті всюди, де згадано «заблоковано» в моєму середовищі — мається на увазі **Claude sandbox limitation**, а не блокування від ALTACO/Hosting Ukraine/adm.tools.

Цю різницю важливо тримати в голові, бо вона змінює список того, що я можу попросити: мені не потрібен «обхід» захисту. Мені потрібні **законні артефакти**, які власник може вивантажити сам.

---

## 1. Мінімальний пакет (без надання прямого доступу до інфраструктури)

Це режим, у якому власник сам збирає файли і експорти і надсилає їх безпечним каналом. **Жодного логіну для мене не потрібно.**

### 1.1 Архів файлів сайту
- **`public_html.tar.gz`** (або `.zip`) — повний знімок директорії `public_html/` поточного домена.
  - Як зробити в Hosting Ukraine adm.tools: «Файловий менеджер» → виділити `public_html` → «Стиснути» → завантажити архів. Або по SSH/SFTP командою `tar -czf public_html.tar.gz public_html/` поза `public_html/`.
  - Розмір зазвичай 1–10 ГБ для Woo-магазину з фото. Якщо завеликий — див. п. 1.4 (тільки `wp-content/`) і п. 1.5 (без `uploads/`).

### 1.2 Дамп бази даних
- **`altaco_db.sql.gz`** — дамп MySQL/MariaDB усієї бази WordPress.
  - В adm.tools: «Бази даних» → phpMyAdmin → Export → SQL → Custom → ✔ Add `DROP TABLE`, ✔ Use transactions, ✔ Disable foreign key checks → стиснути в gzip.
  - Або по SSH: `mysqldump --single-transaction --quick --default-character-set=utf8mb4 --no-tablespaces -u USER -p DBNAME | gzip > altaco_db.sql.gz` (пароль ввести інтерактивно — **не** в командному рядку).
  - Якщо дамп великий, окремо вивантажити структуру: `mysqldump --no-data ... > altaco_schema.sql`.

### 1.3 Структура `wp-content/themes/`
- Можна окремим архівом, якщо повний `public_html` завеликий: `wp-content-themes.tar.gz`.
- Особливо потрібні:
  - всі директорії активної теми та її child-theme (якщо є);
  - підпапка `woocommerce/` усередині теми — там WooCommerce template overrides;
  - файли `functions.php`, `style.css`, `screenshot.png` для всіх тем у директорії.

### 1.4 Структура `wp-content/plugins/`
- `wp-content-plugins.tar.gz` — повний знімок директорії плагінів.
- Якщо власник переживає за вагу через бандловані assets — мінімум потрібні:
  - `*/readme.txt`, `*/*.php` (хоча б корінь кожного плагіна), `*/composer.json`, `*/package.json` — щоб ідентифікувати назву і версію;
  - повна копія активної теми/Woo-related плагінів (наприклад, WooCommerce, WPML/Polylang/TranslatePress, Yoast/RankMath, Loco Translate, кеш-плагін, AJAX Load More).

### 1.5 `wp-content/languages/`
- `wp-content-languages.tar.gz` — усі `.po`/`.mo` файли:
  - кореня (`uk_UA.po`, `uk_UA.mo`, `ru_RU.*`);
  - `themes/<theme-slug>-uk_UA.{po,mo}`;
  - `plugins/<plugin-slug>-uk_UA.{po,mo}`, `woocommerce-uk_UA.{po,mo}` тощо.
- Ці файли пояснюють, **чому частина рядків інтерфейсу залишається англійською/російською** — їх просто немає у відповідному `.mo`.

### 1.6 `wp-config.php` (з замазаними секретами)
- **Перед відправкою замінити на `***REDACTED***`:**
  - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`;
  - усі ключі `AUTH_KEY`, `SECURE_AUTH_KEY`, `LOGGED_IN_KEY`, `NONCE_KEY`, `AUTH_SALT`, `SECURE_AUTH_SALT`, `LOGGED_IN_SALT`, `NONCE_SALT`;
  - `WP_REDIS_PASSWORD`, `SMTP_PASS` і будь-які інші `define(..., '<пароль/токен>');`;
  - значення сторонніх API-ключів (Stripe, LiqPay, Nova Poshta, Google Maps).
- **Залишити (важливо для діагнозу):**
  - `$table_prefix`;
  - усі `define('WP_DEBUG', ...)`, `WP_DEBUG_LOG`, `WP_DEBUG_DISPLAY`, `WP_MEMORY_LIMIT`, `WP_MAX_MEMORY_LIMIT`, `DISALLOW_FILE_EDIT`, `WP_CACHE`, `WP_POST_REVISIONS`, `EMPTY_TRASH_DAYS`, `AUTOSAVE_INTERVAL`, `WP_HOME`, `WP_SITEURL`, `FORCE_SSL_ADMIN`, `CONCATENATE_SCRIPTS`, `ALLOW_UNFILTERED_UPLOADS` тощо;
  - коментарі та порядок директив.

### 1.7 Експорт товарів WooCommerce у CSV
- WP-Admin → **WooCommerce → Products → Export** → ✔ Export all columns → ✔ Export all categories → Generate CSV.
- Файл називати `altaco_products_full_<YYYYMMDD>.csv`.
- Окремо: експорт **атрибутів** і **термінів** (значень атрибутів) — або окремим CSV з плагіна типу *Product Import Export for WooCommerce*, або через адмінку: WooCommerce → Products → Attributes → для кожного атрибута «Configure terms» → копія списку.
- Окремо: експорт категорій товарів (Products → Categories), якщо плагін це підтримує.

### 1.8 Звіт WooCommerce → System Status
- WP-Admin → **WooCommerce → Status → System Status → Get system report → Copy for support** — це текстовий блок, який містить версії WP, Woo, PHP, MySQL, теми, активні плагіни, ліміти памʼяті, outdated templates, статуси сторінок, налаштування доставки/оплати.
- Зберегти як `altaco_woocommerce_system_status.txt`.
- Це **найшвидше** джерело для розділу 2 моєї моделі (Environment) у `ALTACO_SITE_AUDIT_REPORT.md`.

### 1.9 Скріни Plugins / Themes / Site Health
- WP-Admin → **Plugins → Installed Plugins** (включити «Active», «Inactive», «Update available»). Скрін усього списку зі стовпцями Name, Description (з версіями), Auto-updates.
- WP-Admin → **Appearance → Themes** — скрін плитки (видно активну тему, її версію, child-theme).
- WP-Admin → **Tools → Site Health → Status** і **→ Info** (там є експорт у текст: `Copy site info to clipboard`) — зберегти як `altaco_site_health_info.txt`.
- WP-Admin → **Settings → General** — скрін (для `Site Language`, `Timezone`, `WordPress Address`, `Site Address`).
- WP-Admin → **Settings → Permalinks** — скрін.
- WP-Admin → **WooCommerce → Settings → General** і `→ Products` — скріни (locale, валюта, ваги/розміри, dimensions).

### 1.10 Скріни Hosting Ukraine adm.tools
- **PHP-версія:** adm.tools → панель акаунта → «PHP-конфігурація» / «Версія PHP» — скрін показу поточної версії і встановленого `memory_limit`, `max_execution_time`, `post_max_size`, `upload_max_filesize`, `max_input_vars`.
- **WAF / захист:** скрін розділу «Захист» / «WAF» / «ModSec» (якщо такий є в тарифі) — щоб бачити, чи увімкнений захист, які правила.
- **Бекапи:** скрін «Резервні копії» — періодичність, глибина, остання успішна дата. **Перед будь-якими подальшими діями це наша точка відкоту.**
- **Логи:** скрін розділу «Журнали» / «Логи» (якщо доступні через UI) — error_log, access_log; якщо надається завантаження — додати останні 7–14 днів логів архівом.
- **Cron:** скрін «Cron-завдання» / «Заплановані задачі» — щоб бачити, чи є системний крон (часто потрібен `DISABLE_WP_CRON` + системний `wp-cron.php` для magазинів).
- **MySQL версія:** з phpMyAdmin (вгорі праворуч) або з System Status — скрін.

### 1.11 Логи (якщо є)
- `wp-content/debug.log` (якщо існує) — повністю.
- `error_log` у корені `public_html/` — повністю (або останні 5000 рядків).
- `error_log` у `public_html/wp-content/` — те саме.
- Логи Hosting Ukraine за останні 14 днів (error + access).
- **Не редагувати, не «чистити»** перед відправкою — мене цікавлять і свіжі, і застарілі помилки.

### 1.12 Структура каталогу public_html (текстовий список)
- Команда: `find public_html -maxdepth 3 -type d > altaco_tree.txt && find public_html -maxdepth 2 -type f -name '*.php' >> altaco_tree.txt && find public_html -maxdepth 2 -type f \( -name '*.zip' -o -name '*.sql' -o -name '*.tar*' -o -name '*.gz' -o -name '*.bak' \) >> altaco_tree.txt`
- Результат — `altaco_tree.txt`. З цього я побачу, чи лежать у `public_html/` забуті бекапи/архіви/SQL — це окремий security-ризик.

---

## 2. Бажаний пакет (з прямим, але обмеженим доступом)

Оптимальний сценарій. Дозволяє швидше, безпечніше і відтворюваніше.

### 2.1 Staging-копія
- Окремий піддомен (наприклад, `staging.altaco.shop` або `dev.altaco.shop`), не індексується (`X-Robots-Tag: noindex` + `robots.txt: Disallow: /` + http-basic-auth з білим списком IP).
- На staging — повна копія файлів і БД на момент знятого бекапу.
- Search-replace `altaco.shop → staging.altaco.shop` у БД (через WP-CLI `wp search-replace`, з `--dry-run` спочатку).

### 2.2 WP Admin на staging (НЕ на проді)
- Тимчасовий обліковий запис **WP Administrator** на staging з реквізитами, переданими **поза цим чатом** (1Password / Bitwarden / Proton Pass — будь-який менеджер з безпечним sharing з expiry).
- Я використаю його для: WooCommerce → Status → Tools (перегляд, не запуск), Site Health, перегляду налаштувань, але **жодних змін без письмового підтвердження**.

### 2.3 SFTP / file access на staging
- SFTP-логін на staging (не SSH-shell, якщо хостер не любить). Ключ передається поза чатом.
- Ціль: переглянути override-шаблони теми, child-theme, `wp-content/uploads/` структуру, права файлів.

### 2.4 phpMyAdmin або очищений дамп БД на staging
- Доступ до phpMyAdmin на staging (read-only у БД ідеально, але часто phpMyAdmin не вміє це налаштувати — тоді просто доступ до БД staging-копії).
- Альтернатива — **очищений дамп**: видалити з таблиць `wp_users` всі рядки, крім тестового адміна; знеособити `wp_woocommerce_order_items`, `wp_postmeta` (значення `_billing_*`, `_shipping_*` замінити на `***`), `wp_comments`, `wp_actionscheduler_logs`. Цим займається власник або їхній dev — мене може отримати **знеособлений** дамп.

### 2.5 Логи з staging і прода
- staging: повний `debug.log`, `error_log`.
- прод: останні 14 днів `error_log` + `debug.log` (якщо `WP_DEBUG_LOG` увімкнений; якщо ні — тимчасово увімкнути на staging).

### 2.6 Підтвердження бекапу
- Скрін успішного **повного** бекапу прода (файли + БД) **до** будь-яких маніпуляцій з staging-копією. Бекап має бути збережений мінімум у двох місцях: на хостингу і офлайн (S3, Google Drive, локально).
- Без цього підтвердження я не починаю навіть staging-роботу.

---

## 3. Чого **не** слід надсилати в чат / у репозиторій

Ці артефакти **ніколи** не вкладати в Git, в коментарі, у звіт чи в чат — навіть приватний:

- **Будь-які паролі** (адмін WP, SSH, FTP, MySQL, adm.tools, поштові, SMTP).
- **API-ключі та токени:**
  - Stripe / LiqPay / WayForPay / Fondy `secret_key`;
  - Nova Poshta API key;
  - Google API keys (Maps, reCAPTCHA secret);
  - Mailgun/SendGrid/SMTP credentials;
  - WP Application Passwords;
  - JWT secrets, `AUTH_*` salts з `wp-config.php`.
- **Секретні директиви з `wp-config.php`** — `DB_PASSWORD`, ключі солей, токени плагінів. Тільки відредагований варіант з `***REDACTED***`.
- **Особисті дані клієнтів (PII):**
  - таблиці `wp_users`, `wp_usermeta` без знеособлення;
  - таблиці `wp_woocommerce_order_*`, `wp_wc_orders`, `wp_postmeta` з `_billing_*`/`_shipping_*` без знеособлення;
  - експорти замовлень з ПІБ, телефонами, адресами, email, IP;
  - експорти підписників/розсилки.
- **Платіжна інформація** будь-якого вигляду (PAN, CVV, дати) — навіть випадково в логах. Якщо в `error_log` помічено фрагменти карт чи токенів — стирати перед відправкою (чи краще, не передавати такий лог взагалі і повідомити власника).
- **Двофакторні коди / OTP** — взагалі ніколи нікому.

**Правильний канал передачі секретів** (якщо стане потрібно для staging-доступу):
- 1Password / Bitwarden / Proton Pass — секретний share з обмеженням за часом і IP;
- одноразові посилання типу onetimesecret.com / pwpush — посилання передається в безпечному месенджері, видаляється після прочитання;
- **не** в Telegram, не в email, не в Notion-сторінці без шифрування, не в issue/PR.

**Правильний канал передачі архівів файлів і БД:**
- приватний Google Drive / Dropbox / Mega з обмеженим доступом і expiry (7–14 днів);
- WeTransfer Pro з паролем (пароль — окремим каналом);
- S3 presigned URL з expiry;
- **не** як вкладення в публічний чат і **не** комітом у Git-репозиторій.

---

## 4. Допустимі наступні задачі (після того як пакет буде на руках)

Виконуються виключно **read-only**, на staging (або на знятій локальній копії), з підтвердженням власника перед кожним кроком.

### 4.1 Inspect files and database (read-only)
- Перерахувати всі активні плагіни і їх версії, звірити з WPScan / WordPress.org (CVE).
- Перерахувати теми, знайти child-theme, скласти список WooCommerce template overrides (`wp-content/themes/<theme>/woocommerce/**`).
- Знайти hardcoded-рядки англійською/російською у файлах теми (`grep -rn 'echo\|print\|esc_html\|__\|_e' wp-content/themes/<active>` — звірити, які рядки не обгорнуті в `__()` / `_e()`).
- В БД: `wp_terms` + `wp_term_taxonomy` — знайти дублікати по полю `name` у таксономіях, що починаються на `pa_`.
- В БД: знайти товари з порожніми атрибутами (`wp_postmeta`, ключ `_product_attributes` = `a:0:{}` чи відсутній).
- В БД: знайти, чи `pa_price` існує як таксономія (антипатерн).
- Перевірити `wp_options`: `template`, `stylesheet`, `WPLANG`, `siteurl`, `home`, `active_plugins`, `woocommerce_version`, `db_version`, всі `_transient_*` що зависли.

### 4.2 Update `ALTACO_SITE_AUDIT_REPORT.md`
- Замінити всі позначки `[No access / not verified]` на реальні значення.
- Додати реальні номери версій WP / Woo / PHP / MySQL.
- Зафіксувати реальний список плагінів і їх ризики.

### 4.3 Створити `ALTACO_TECHNICAL_AUDIT.md`
- Глибокий розбір тех-стеку, БД, теми, плагінів, продуктивності, безпеки.
- З цитатами файлів і рядків з логів.
- З конкретними CVE-посиланнями для застарілих плагінів, якщо такі знайдемо.

### 4.4 Створити `ALTACO_FIX_PLAN.md`
- Конкретні quick fixes, medium fixes — кожен з:
  - очікуваним ефектом;
  - ризиком (low/medium/high);
  - часом виконання;
  - умовою rollback (як відкотити, якщо щось зламалось);
  - чи потрібне підтвердження власника окремо.

### 4.5 Створити `ALTACO_REBUILD_DECISION.md`
- Документ для рішення «лагодити vs переробляти», з оцінкою:
  - тех-боргу в годинах;
  - ризиків продовження на поточній архітектурі;
  - вартості нового каталогу (тема vs headless);
  - migration-плану (CSV → новий каталог, мапінг атрибутів, hreflang/locale-стратегія);
  - рекомендацією A / B / C з обґрунтуванням на фактах.

---

## 5. Жорсткі обмеження, які зберігаються

- **Не** модифікую сайт.
- **Не** прошу паролі, ключі, токени в чаті — тільки через безпечний менеджер секретів.
- **Не** виконую write-дії: не оновлюю плагіни/тему/WP/PHP, не правлю БД, не редагую `wp-config.php`, не торкаюсь DNS, не запускаю «repair»/«optimize», не вмикаю/вимикаю плагіни.
- **Залишаюсь на гілці** `claude/altaco-site-audit-fasOW` для всіх пов'язаних з аудитом артефактів. Нову гілку створюю лише за прямим розпорядженням.

---

## 6. Чек-лист готовності пакета (для власника)

Мінімальний пакет вважається готовим, коли надіслано:

- [ ] `public_html.tar.gz` (або окремо `wp-content-themes.tar.gz` + `wp-content-plugins.tar.gz` + `wp-content-languages.tar.gz`)
- [ ] `altaco_db.sql.gz` (або знеособлена версія)
- [ ] `wp-config.redacted.php`
- [ ] `altaco_products_full_YYYYMMDD.csv`
- [ ] `altaco_woocommerce_system_status.txt`
- [ ] `altaco_site_health_info.txt`
- [ ] Скрін Plugins (повний список з версіями)
- [ ] Скрін Themes
- [ ] Скрін PHP-версії та лімітів в adm.tools
- [ ] Скрін WAF / захисту в adm.tools
- [ ] Скрін розділу бекапів в adm.tools
- [ ] Скрін cron-завдань
- [ ] `error_log` + `debug.log` за останні 14 днів
- [ ] `altaco_tree.txt` (структура каталогу)

Бажаний пакет додатково:
- [ ] staging URL
- [ ] WP Admin на staging (реквізити поза чатом)
- [ ] SFTP staging (реквізити поза чатом)
- [ ] phpMyAdmin / БД staging
- [ ] Підтвердження бекапу прода

Коли все буде на руках — переходимо до п. 4 (Inspect → Update audit → Technical audit → Fix plan → Rebuild decision).
