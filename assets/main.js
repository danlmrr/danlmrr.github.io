/* ttrnkv — общий скрипт сайта */

/* ЗАМЕНИ: ник в Telegram без @. Все кнопки «Написать» на сайте возьмут его отсюда. */
var TG_NICK = 'ТВОЙ_НИК';

(function () {
  document.documentElement.classList.remove('no-js');

  /* шапка: прозрачная наверху, матовое стекло при прокрутке */
  var root = document.documentElement;
  var scrolled = null, ticking = false;
  function onScroll() {
    ticking = false;
    var now = scrollY > 40;
    if (now !== scrolled) { scrolled = now; root.classList.toggle('is-scrolled', now); }
  }
  /* размеры для «собирающейся» шапки */
  var bar = document.querySelector('.head__bar');
  function measure() {
    if (!bar) return;
    var full = bar.clientWidth, glass = Math.min(980, full);
    bar.style.setProperty('--gw', glass + 'px');
    bar.style.setProperty('--gs', (full / glass).toFixed(4));
    bar.style.setProperty('--shift', ((full - glass) / 2 + (innerWidth > 720 ? 18 : 10)) + 'px');
  }
  measure(); addEventListener('resize', measure);
  onScroll();
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ссылки на Telegram */
  document.querySelectorAll('[data-tg]').forEach(function (a) {
    a.href = 'https://t.me/' + TG_NICK;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* мобильное меню */
  var burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* картинки по имени файла: если файл загружен — показываем его и убираем подпись-заглушку */
  document.querySelectorAll('[data-bg]').forEach(function (el) {
    var src = el.dataset.bg, img = new Image();
    img.onload = function () { el.style.backgroundImage = 'url("' + src + '")'; el.removeAttribute('data-ph'); };
    img.src = src;
  });

  /* пустые ссылки-заглушки не прыгают наверх */
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* фильтр работ */
  var chips = document.querySelectorAll('.chip');
  var cases = document.querySelectorAll('.case[data-cat]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      cases.forEach(function (el, i) {
        var show = cat === 'all' || el.dataset.cat.split(' ').indexOf(cat) !== -1;
        el.hidden = !show;
        el.classList.toggle('case--wide', show && cat === 'all' && el.dataset.wide === '1');
      });
    });
  });

  /* поп-ап видео */
  var lb = document.querySelector('.lb');
  if (lb) {
    var frame = lb.querySelector('.lb__frame'), closeBtn = lb.querySelector('.lb__close'), lastFocus = null;
    function closeLb() {
      lb.classList.remove('is-open');
      frame.innerHTML = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-video]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lastFocus = btn;
        var src = btn.dataset.video;
        frame.classList.toggle('lb__frame--v', btn.dataset.vertical === '1');
        frame.classList.toggle('lb__frame--round', btn.dataset.round === '1');
        frame.innerHTML = src
          ? '<iframe src="' + src + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Видео"></iframe>'
          : '<div class="lb__empty">' + (document.documentElement.lang === 'en' ? 'Video coming soon' : 'Видео скоро будет здесь') + '</div>';
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
      });
    });
    closeBtn.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb(); });
  }

  /* плёночное зерно: готовая текстура, движется сдвигом (без перерисовки) */
  var grain = document.createElement('div'); grain.className = 'grain'; grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  /* светящиеся пятна в тёмных блоках */
  document.querySelectorAll('.dark, .cta' + (document.documentElement.classList.contains('theme-dark') ? ', .hero' : '')).forEach(function (s) {
    s.insertAdjacentHTML('afterbegin', '<span class="glow glow--1" aria-hidden="true"></span><span class="glow glow--2" aria-hidden="true"></span>');
  });

  /* монтаж: вкладки вертикальные / горизонтальные */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  /* голосовые отзывы */
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0E0E0E" d="M7 4.5v15l13-7.5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0E0E0E" d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  var current = null;
  document.querySelectorAll('.voice').forEach(function (v) {
    var btn = v.querySelector('.voice__btn'), bars = v.querySelectorAll('.voice__wave i'), time = v.querySelector('.voice__time');
    var src = v.dataset.audio;
    function fmt(t) { t = Math.max(0, t | 0); return (t / 60 | 0) + ':' + ('0' + t % 60).slice(-2); }
    if (!src) { btn.disabled = true; return; }
    btn.disabled = true;
    fetch(src, { method: 'HEAD' }).then(function (r) { if (r.ok) btn.disabled = false; }).catch(function () {});
    var audio = new Audio(); audio.preload = 'none'; audio.src = src;
    audio.addEventListener('error', function () { btn.disabled = true; });
    audio.addEventListener('loadedmetadata', function () { time.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', function () {
      var k = audio.duration ? audio.currentTime / audio.duration : 0;
      bars.forEach(function (b, i) { b.classList.toggle('on', i / bars.length < k); });
      time.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', function () { btn.innerHTML = PLAY; btn.setAttribute('aria-label', btn.dataset.play); });
    btn.addEventListener('click', function () {
      if (audio.paused) {
        if (current && current !== audio) current.pause();
        document.querySelectorAll('.voice__btn').forEach(function (b) { if (b !== btn && !b.disabled) { b.innerHTML = PLAY; } });
        audio.play(); current = audio; btn.innerHTML = PAUSE; btn.setAttribute('aria-label', btn.dataset.pause);
      } else { audio.pause(); btn.innerHTML = PLAY; btn.setAttribute('aria-label', btn.dataset.play); }
    });
  });

  /* появление блоков при прокрутке */
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
