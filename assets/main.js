/* ttrnkv — общий скрипт сайта */

/* ЗАМЕНИ: ник в Telegram без @. Все кнопки «Написать» на сайте возьмут его отсюда. */
var TG_NICK = 'ТВОЙ_НИК';

(function () {
  document.documentElement.classList.remove('no-js');

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
        frame.innerHTML = src
          ? '<iframe src="' + src + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Видео"></iframe>'
          : '<div class="lb__empty">Видео скоро будет здесь</div>';
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
      });
    });
    closeBtn.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb(); });
  }

  /* плёночное зерно: шум перерисовывается ~12 раз в секунду, как у плёнки */
  (function () {
    var c = document.createElement('canvas'); c.className = 'grain'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var ctx = c.getContext('2d'), T = 160, tiles = [];
    for (var k = 0; k < 6; k++) {
      var t = document.createElement('canvas'); t.width = t.height = T;
      var tc = t.getContext('2d'), d = tc.createImageData(T, T);
      for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      tc.putImageData(d, 0, 0); tiles.push(t);
    }
    function size() { c.width = Math.ceil(innerWidth / 2); c.height = Math.ceil(innerHeight / 2); c.style.imageRendering = 'auto'; }
    function draw() {
      var p = ctx.createPattern(tiles[Math.random() * tiles.length | 0], 'repeat');
      ctx.save(); ctx.translate(-(Math.random() * T | 0), -(Math.random() * T | 0));
      ctx.fillStyle = p; ctx.fillRect(0, 0, c.width + T, c.height + T); ctx.restore();
    }
    size(); draw(); addEventListener('resize', function () { size(); draw(); });
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches, last = 0;
    if (!still) (function loop(ts) { if (ts - last > 80 && !document.hidden) { draw(); last = ts; } requestAnimationFrame(loop); })(0);
  })();

  /* светящиеся пятна в тёмных блоках */
  document.querySelectorAll('.dark, .cta').forEach(function (s) {
    s.insertAdjacentHTML('afterbegin', '<span class="glow glow--1" aria-hidden="true"></span><span class="glow glow--2" aria-hidden="true"></span>');
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
