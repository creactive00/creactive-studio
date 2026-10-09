/* Creactive Studio – main.js (ohne Abhängigkeiten) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var I = {};
  try { I = JSON.parse($('#i18n').textContent); } catch (e) {}
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sprache merken ---------- */
  store.set('cs-lang', I.lang);
  $$('.lang-switch a').forEach(function (a) {
    a.addEventListener('click', function () { store.set('cs-lang', a.getAttribute('data-lang')); });
    // Anker (#contact usw.) beim Sprachwechsel mitnehmen
    a.addEventListener('mousedown', function () { if (location.hash) a.hash = location.hash; });
  });

  /* ---------- Header ---------- */
  var header = $('[data-header]');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 20); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile-Menü ---------- */
  var burger = $('[data-burger]'), nav = $('[data-nav]');
  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? burger.dataset.close : burger.dataset.open);
    if (open) { var f = $('a', nav); f && f.focus(); }
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); burger.focus(); } });
  }

  /* ---------- Aktiver Menüpunkt (Scrollspy) ---------- */
  var navLinks = $$('.nav-list a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); s && spy.observe(s); });
  }

  /* ---------- Scroll-Reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-visible'); });

  /* ---------- Zahlen hochzählen ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) { el.classList.add('is-placeholder'); return; }
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1600;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v; if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 });
    o.observe(el);
  });

  /* ---------- Portfolio-Filter ---------- */
  var filters = $('[data-filters]'), grid = $('[data-grid]');
  if (filters && grid) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      var f = b.dataset.filter;
      $$('[data-filter]', filters).forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', on); });
      $$('.project', grid).forEach(function (li) {
        var show = f === 'all' || li.dataset.cat === f;
        li.classList.toggle('is-hidden', !show);
        if (show) { li.classList.remove('is-visible'); void li.offsetWidth; li.classList.add('is-visible'); }
      });
    });
  }

  /* ---------- Lightbox + Vorher/Nachher ---------- */
  var lb = $('[data-lightbox]'), projects = I.projects || [], P = I.portfolio || {};
  var root = (function () { var l = $('link[rel="stylesheet"]'); return l ? l.getAttribute('href').replace(/assets\/css\/style\.css.*$/, '') : '../'; })();
  var current = 0, lastFocus = null, order = [];
  function imgTag(name, alt, cls) {
    return '<img class="' + (cls || '') + '" src="' + root + 'assets/img/' + name + '.webp" srcset="' + root + 'assets/img/' + name + '-800.webp 800w, ' + root + 'assets/img/' + name + '.webp 1600w" sizes="(min-width: 860px) 65vw, 100vw" alt="' + esc(alt) + '" width="1600" height="1100">';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render(i) {
    var pr = projects[order[i]]; if (!pr) return;
    current = i;
    var media = $('[data-lb-media]', lb);
    if (pr.before) {
      media.innerHTML = '<div class="compare">' + imgTag(pr.img, pr.alt, 'cmp-after') + imgTag(pr.before, P.before + ': ' + pr.alt, 'cmp-before') +
        '<span class="cmp-label l">' + esc(P.before) + '</span><span class="cmp-label r">' + esc(P.after) + '</span>' +
        '<input type="range" min="0" max="100" value="50" aria-label="' + esc(P.compareLabel) + '"><span class="compare-line" aria-hidden="true"></span></div>';
      var cmp = $('.compare', media), rng = $('input', cmp);
      var upd = function () { cmp.style.setProperty('--pos', rng.value + '%'); rng.setAttribute('aria-valuetext', P.before + ' ' + rng.value + '%'); };
      rng.addEventListener('input', upd); upd();
    } else media.innerHTML = imgTag(pr.img, pr.alt);
    $('[data-lb-cat]', lb).textContent = pr.service;
    $('[data-lb-title]', lb).textContent = pr.title;
    $('[data-lb-desc]', lb).textContent = pr.desc;
    $('[data-lb-meta]', lb).innerHTML =
      '<div><dt>' + esc(P.client) + '</dt><dd>' + esc(pr.client) + '</dd></div>' +
      '<div><dt>' + esc(P.location) + '</dt><dd>' + esc(pr.location) + '</dd></div>' +
      '<div><dt>' + esc(P.service) + '</dt><dd>' + esc(pr.service) + '</dd></div>';
    $('[data-lb-count]', lb).textContent = (i + 1) + ' / ' + order.length;
    var multi = order.length > 1;
    $('[data-lb-prev]', lb).hidden = !multi; $('[data-lb-next]', lb).hidden = !multi;
  }
  function openLb(idx) {
    // nur sichtbare (gefilterte) Projekte durchblättern
    order = $$('.project:not(.is-hidden) [data-project]').map(function (b) { return +b.dataset.project; });
    lastFocus = document.activeElement;
    lb.hidden = false; document.body.style.overflow = 'hidden';
    render(Math.max(0, order.indexOf(idx)));
    $('.lb-close', lb).focus();
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; $('[data-lb-media]', lb).innerHTML = ''; lastFocus && lastFocus.focus(); }
  if (lb) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-project]'); if (b) openLb(+b.dataset.project);
      if (e.target.closest('[data-lb-close]')) closeLb();
      if (e.target.closest('[data-lb-prev]')) render((current - 1 + order.length) % order.length);
      if (e.target.closest('[data-lb-next]')) render((current + 1) % order.length);
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.target.type === 'range') return;
      if (e.key === 'ArrowRight' && order.length > 1) render((current + 1) % order.length);
      if (e.key === 'ArrowLeft' && order.length > 1) render((current - 1 + order.length) % order.length);
      if (e.key === 'Tab') { // Fokusfalle
        var f = $$('button:not([hidden]), input, a[href]', lb).filter(function (x) { return x.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Testimonial-Slider ---------- */
  $$('[data-slider]').forEach(function (sl) {
    var track = $('[data-track]', sl), slides = $$('.slide', track), dots = $$('[data-dots] span', sl);
    var idx = function () { return Math.round(track.scrollLeft / (slides[0].offsetWidth + 16)); };
    var go = function (i) { i = (i + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' }); };
    $('[data-prev]', sl).addEventListener('click', function () { go(idx() - 1); });
    $('[data-next]', sl).addEventListener('click', function () { go(idx() + 1); });
    track.addEventListener('scroll', function () { var i = Math.min(slides.length - 1, idx()); dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); }); }, { passive: true });
  });

  /* ---------- Cookie-Hinweis & Google Maps (Zwei-Klick-Lösung) ---------- */
  var cookie = $('[data-cookie]'), mapsBox = $('[data-consent-maps]');
  function getConsent() { try { return JSON.parse(store.get('cs-consent')); } catch (e) { return null; } }
  function setConsent(maps) {
    store.set('cs-consent', JSON.stringify({ necessary: true, maps: !!maps, ts: new Date().toISOString() }));
    hideCookie(); if (maps) loadMap();
  }
  function showCookie(settings) {
    cookie.hidden = false; document.body.classList.add('cookie-visible');
    var c = getConsent(); mapsBox.checked = !!(c && c.maps);
    $('[data-cookie-options]', cookie).hidden = !settings;
    $('[data-cookie-save]', cookie).hidden = !settings;
    $('[data-cookie-settings]', cookie).hidden = !!settings;
    requestAnimationFrame(function () { document.documentElement.style.setProperty('--cookie-h', cookie.offsetHeight + 'px'); });
  }
  function hideCookie() { cookie.hidden = true; document.body.classList.remove('cookie-visible'); }
  function loadMap() {
    var m = $('[data-map]'); if (!m || $('iframe', m)) return;
    var f = document.createElement('iframe');
    f.src = I.map.src; f.title = I.map.title; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    m.innerHTML = ''; m.appendChild(f);
  }
  if (cookie) {
    var c = getConsent();
    if (!c) showCookie(false); else if (c.maps) loadMap();
    $('[data-cookie-accept]', cookie).addEventListener('click', function () { setConsent(true); });
    $('[data-cookie-reject]', cookie).addEventListener('click', function () { setConsent(false); });
    $('[data-cookie-save]', cookie).addEventListener('click', function () { setConsent(mapsBox.checked); });
    $('[data-cookie-settings]', cookie).addEventListener('click', function () { showCookie(true); });
    $$('[data-cookie-open]').forEach(function (b) { b.addEventListener('click', function () { showCookie(true); $('[data-consent-maps]').focus(); }); });
  }
  $$('[data-map-load]').forEach(function (b) {
    b.addEventListener('click', function () { var c = getConsent() || {}; store.set('cs-consent', JSON.stringify({ necessary: true, maps: true, ts: new Date().toISOString() })); hideCookie(); loadMap(); });
  });

  /* ---------- Videos: Start bei Mouseover (mit Ton), Pause beim Verlassen ---------- */
  $$('[data-hover-videos]').forEach(function (grid) {
    var labOn = grid.dataset.soundOn, labOff = grid.dataset.soundOff;
    $$('.video-card', grid).forEach(function (card) {
      var v = $('video', card), btn = document.createElement('button'), wantSound = true;
      btn.type = 'button'; btn.className = 'video-sound';
      function paint() { var on = !v.muted; btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? labOn : labOff); btn.classList.toggle('is-on', on); }
      function start() {
        v.muted = !wantSound;
        var p = v.play();
        if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); paint(); });
        paint();
      }
      function stop() { v.pause(); v.currentTime = 0; }
      btn.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="wave" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="cross" d="m16 9 5 6m0-6-5 6"/></svg>';
      btn.addEventListener('click', function (e) { e.stopPropagation(); wantSound = v.muted; v.muted = !wantSound; paint(); if (v.paused) start(); });
      card.appendChild(btn); v.muted = false; paint();
      card.addEventListener('mouseenter', start); card.addEventListener('mouseleave', stop);
      card.addEventListener('focusin', start); card.addEventListener('focusout', stop);
      card.tabIndex = 0;
      card.addEventListener('click', function () { if (v.paused) start(); else stop(); }); // Touch: Tippen startet/stoppt
    });
  });
  /* ---------- Formular ---------- */
  var form = $('[data-form]');
  if (form) {
    var E = I.errors || {}, F = I.form || {};
    var MAX = 10 * 1024 * 1024, EXT = /\.(jpe?g|png|webp|pdf|ai|eps|svg|zip)$/i;
    var file = $('#f-file', form), fileName = $('[data-file-name]', form), drop = $('.file-drop', form);
    var setErr = function (input, msg) {
      var fld = input.closest('.field'), out = $('#e-' + input.name, form);
      fld.classList.toggle('has-error', !!msg); input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (out) out.textContent = msg || '';
      return !msg;
    };
    var check = function (input) {
      var v = (input.value || '').trim();
      if (input.type === 'checkbox') return setErr(input, input.checked ? '' : E.consent);
      if (input.type === 'file') {
        var f = input.files && input.files[0];
        if (!f) return setErr(input, '');
        if (f.size > MAX) return setErr(input, E.fileSize);
        if (!EXT.test(f.name)) return setErr(input, E.fileType);
        return setErr(input, '');
      }
      if (input.required && !v) return setErr(input, E.required);
      if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr(input, E.email);
      if (input.type === 'tel' && v && !/^[+()\d\s\/-]{6,}$/.test(v)) return setErr(input, E.phone);
      return setErr(input, '');
    };
    var fields = $$('input:not([type=hidden]):not([name=website]), select, textarea', form);
    fields.forEach(function (i) {
      i.addEventListener('blur', function () { if (i.type !== 'file') check(i); });
      i.addEventListener('input', function () { if (i.closest('.field').classList.contains('has-error')) check(i); });
    });
    file.addEventListener('change', function () { fileName.textContent = file.files[0] ? file.files[0].name : F.fileNone; check(file); });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-drag'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); } });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('[data-form-status]', form), btn = $('[data-submit]', form);
      var bad = fields.filter(function (i) { return !check(i); });
      if (bad.length) { status.innerHTML = '<p class="err">' + esc(E.summary) + '</p>'; bad[0].focus(); return; }
      var label = btn.innerHTML; btn.disabled = true; btn.textContent = F.sending; status.innerHTML = '';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error('fail');
          status.innerHTML = '<p class="ok">' + esc(F.success) + '</p>';
          form.reset(); fileName.textContent = F.fileNone;
        })
        .catch(function () { status.innerHTML = '<p class="err">' + esc(F.error) + '</p>'; })
        .then(function () { btn.disabled = false; btn.innerHTML = label; status.focus && status.setAttribute('tabindex', '-1'); status.focus(); });
    });
  }

  /* Leistung auf Unterseiten vorbelegen ist serverseitig gelöst; Jahr aktuell halten */
  $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
