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
