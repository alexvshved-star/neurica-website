(function () {
  var lang = document.documentElement.lang || 'uk';
  var isEn = lang === 'en' || window.location.pathname.indexOf('-en') !== -1;

  var lines = isEn ? [
    'NEURICA BIOS v2.6.1  (C) 1986 EONYX Corp.',
    'CPU: Intel 8088 @ 4.77 MHz  [OK]',
    'Memory Test: 640K OK',
    'Initializing Neural Subsystem... [OK]',
    'Loading EMPATHY.SYS... [OK]',
    'Loading TRAUMA_SUPPORT.DRV... [OK]',
    'Connecting to Inner World... [OK]',
    'PTSD Support Module activated.',
    'Starting NEURICA v1.0...',
    ' ',
    'C:\\> NEURICA.EXE'
  ] : [
    'NEURICA BIOS v2.6.1  (C) 1986 EONYX Corp.',
    'CPU: Intel 8088 @ 4.77 МГц  [OK]',
    'Тест пам'яті: 640K OK',
    'Ініціалізація нейронної підсистеми... [OK]',
    'Завантаження EMPATHY.SYS... [OK]',
    'Завантаження TRAUMA_SUPPORT.DRV... [OK]',
    'Підключення до внутрішнього світу... [OK]',
    'Модуль підтримки ПТСР активовано.',
    'Запуск NEURICA v1.0...',
    ' ',
    'C:\\> NEURICA.EXE'
  ];

  var style = document.createElement('style');
  style.textContent = '#dos-splash{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:40px 60px;box-sizing:border-box;transition:opacity 0.8s ease;cursor:pointer;}#dos-splash .dos-line{font-family:"Courier New",Courier,monospace;font-size:clamp(12px,1.8vw,18px);color:#33ff33;line-height:1.7;opacity:0;transition:opacity 0.15s;}#dos-splash .dos-cursor{display:inline-block;width:10px;height:1.1em;background:#33ff33;vertical-align:text-bottom;animation:blink 0.8s step-end infinite;}@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}';
  document.head.appendChild(style);

  var splash = document.createElement('div');
  splash.id = 'dos-splash';
  document.body.insertBefore(splash, document.body.firstChild);

  var lineEls = [];
  lines.forEach(function (text) {
    var el = document.createElement('div');
    el.className = 'dos-line';
    el.textContent = text;
    splash.appendChild(el);
    lineEls.push(el);
  });

  var cursor = document.createElement('span');
  cursor.className = 'dos-cursor';
  if (lineEls.length > 0) lineEls[lineEls.length - 1].appendChild(cursor);

  function dismiss() {
    splash.style.opacity = '0';
    setTimeout(function () { splash.style.display = 'none'; }, 800);
    document.removeEventListener('keydown', dismiss);
    splash.removeEventListener('click', dismiss);
  }

  var delay = 0;
  lineEls.forEach(function (el, i) {
    delay += (i === 0 ? 300 : 500);
    setTimeout(function () { el.style.opacity = '1'; }, delay);
  });

  var totalTime = delay + 1800;
  setTimeout(dismiss, totalTime);

  splash.addEventListener('click', dismiss);
  document.addEventListener('keydown', dismiss);
})();
