/* Creactive Studio – chatbot.js (ohne Abhängigkeiten, ohne Cookies/Tracking)
   Sammelt Anfragen im Chat und schickt sie über /.netlify/functions/chat an WhatsApp. */
(function () {
  'use strict';
  var ENDPOINT = '/.netlify/functions/chat';
  var WA_NUMBER = '38972600308';

  var T = {
    sq: {
      open: 'Bisedoni me ne', close: 'Mbyll', title: 'Creactive Studio', status: 'Zakonisht përgjigjemi brenda ditës',
      greet: 'Përshëndetje! 👋 Jam asistenti i Creactive Studio. Për çfarë shërbimi po interesoheni?',
      topics: ['Printim reklamash', 'Dizajn 3D', 'Totema reklamues', 'Dizajn muresh', 'Branding & logo', 'Diçka tjetër'],
      askName: 'Faleminderit! Si quheni?',
      askContact: 'Ku mund t\'ju kontaktojmë? Shkruani numrin e telefonit ose emailin.',
      badContact: 'Ju lutemi shkruani një numër telefoni ose email të vlefshëm.',
      askMsg: 'Shkruani shkurt çfarë ju nevojitet (përmasa, vendi, afati …).',
      consent: 'Mesazhi juaj do t\'i dërgohet ekipit tonë përmes WhatsApp. Më shumë te',
      privacy: 'politika e privatësisë', privacyUrl: '/sq/privatesia/',
      yes: 'Po, dërgo', no: 'Anulo', sending: 'Duke u dërguar …',
      ok: 'Faleminderit, {name}! Mesazhi u dërgua. Do t\'ju kontaktojmë sa më shpejt.',
      err: 'Fatkeqësisht nuk funksionoi. Shkruani drejtpërdrejt në WhatsApp:', wa: 'Hap WhatsApp',
      cancelled: 'Në rregull, asgjë nuk u dërgua. Mund të filloni përsëri kur të doni.', restart: 'Fillo përsëri',
      ph: 'Shkruani këtu …', send: 'Dërgo', tooShort: 'Ju lutemi shkruani pak më shumë.', waText: 'Përshëndetje Creactive Studio, dëshiroj të kërkoj një ofertë.'
    },
    mk: {
      open: 'Разговарајте со нас', close: 'Затвори', title: 'Creactive Studio', status: 'Обично одговараме во рок од еден ден',
      greet: 'Здраво! 👋 Јас сум асистентот на Creactive Studio. Која услуга ве интересира?',
      topics: ['Печатење реклами', '3D дизајн', 'Рекламни тотеми', 'Дизајн на ѕидови', 'Брендинг и лого', 'Нешто друго'],
      askName: 'Ви благодариме! Како се викате?',
      askContact: 'Како можеме да ве контактираме? Напишете телефонски број или е-пошта.',
      badContact: 'Ве молиме внесете валиден телефонски број или е-пошта.',
      askMsg: 'Напишете накратко што ви треба (димензии, локација, рок …).',
      consent: 'Вашата порака ќе му биде испратена на нашиот тим преку WhatsApp. Повеќе во',
      privacy: 'политиката за приватност', privacyUrl: '/mk/privatnost/',
      yes: 'Да, испрати', no: 'Откажи', sending: 'Се испраќа …',
      ok: 'Ви благодариме, {name}! Пораката е испратена. Ќе ве контактираме што побрзо.',
      err: 'За жал, не успеа. Пишете ни директно на WhatsApp:', wa: 'Отвори WhatsApp',
      cancelled: 'Во ред, ништо не е испратено. Можете да започнете повторно кога сакате.', restart: 'Започни повторно',
      ph: 'Напишете тука …', send: 'Испрати', tooShort: 'Ве молиме напишете малку повеќе.', waText: 'Здраво Creactive Studio, сакам да побарам понуда.'
    },
    de: {
      open: 'Chatten Sie mit uns', close: 'Schließen', title: 'Creactive Studio', status: 'Wir antworten meist innerhalb eines Tages',
      greet: 'Hallo! 👋 Ich bin der Assistent von Creactive Studio. Wofür interessieren Sie sich?',
      topics: ['Werbeprint', '3D-Design', 'Werbetotems', 'Wanddesign', 'Branding & Logo', 'Etwas anderes'],
      askName: 'Danke! Wie heißen Sie?',
      askContact: 'Wie können wir Sie erreichen? Bitte Telefonnummer oder E-Mail eingeben.',
      badContact: 'Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.',
      askMsg: 'Beschreiben Sie kurz, was Sie brauchen (Maße, Ort, Termin …).',
      consent: 'Ihre Nachricht wird per WhatsApp an unser Team weitergeleitet. Mehr dazu in der',
      privacy: 'Datenschutzerklärung', privacyUrl: '/de/datenschutz/',
      yes: 'Ja, senden', no: 'Abbrechen', sending: 'Wird gesendet …',
      ok: 'Danke, {name}! Ihre Nachricht ist angekommen. Wir melden uns so bald wie möglich.',
      err: 'Das hat leider nicht geklappt. Schreiben Sie uns direkt per WhatsApp:', wa: 'WhatsApp öffnen',
      cancelled: 'Alles klar, es wurde nichts gesendet. Sie können jederzeit neu starten.', restart: 'Neu starten',
      ph: 'Hier schreiben …', send: 'Senden', tooShort: 'Bitte schreiben Sie etwas mehr.', waText: 'Hallo Creactive Studio, ich möchte ein Angebot anfragen.'
    },
    en: {
      open: 'Chat with us', close: 'Close', title: 'Creactive Studio', status: 'We usually reply within a day',
      greet: 'Hello! 👋 I\'m the Creactive Studio assistant. What are you interested in?',
      topics: ['Advertising print', '3D design', 'Advertising totems', 'Wall design', 'Branding & logo', 'Something else'],
      askName: 'Thanks! What\'s your name?',
      askContact: 'How can we reach you? Please enter a phone number or email.',
      badContact: 'Please enter a valid phone number or email address.',
      askMsg: 'Briefly describe what you need (size, location, deadline …).',
      consent: 'Your message will be forwarded to our team via WhatsApp. More in the',
      privacy: 'privacy policy', privacyUrl: '/en/privacy/',
      yes: 'Yes, send', no: 'Cancel', sending: 'Sending …',
      ok: 'Thank you, {name}! Your message has been sent. We\'ll get back to you as soon as possible.',
      err: 'Sorry, that didn\'t work. Please message us directly on WhatsApp:', wa: 'Open WhatsApp',
      cancelled: 'No problem, nothing was sent. You can start again any time.', restart: 'Start again',
      ph: 'Type here …', send: 'Send', tooShort: 'Please write a little more.', waText: 'Hello Creactive Studio, I\'d like to request a quote.'
    }
  };

  var lang = (document.documentElement.lang || 'sq').slice(0, 2).toLowerCase();
  var t = T[lang] || T.sq;
  var sendLabel = function () { return t.send; };

  /* ---------- Styles ---------- */
  var css = [
    '.cs-chat-btn{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(92px,calc(env(safe-area-inset-bottom) + 76px));z-index:149;display:flex;align-items:center;gap:.5rem;height:52px;padding:0 18px;border:0;border-radius:999px;background:var(--accent,#F7BC0A);color:var(--accent-ink,#0B0B0C);font:700 .95rem/1 var(--ff-body,system-ui,sans-serif);cursor:pointer;box-shadow:0 10px 30px -8px rgba(247,188,10,.55);transition:transform .25s}',
    '.cs-chat-btn:hover{transform:translateY(-3px)}',
    '.cs-chat-btn:focus-visible,.cs-chat-panel button:focus-visible,.cs-chat-panel input:focus-visible,.cs-chat-panel a:focus-visible{outline:2px solid var(--accent-2,#FFCB2E);outline-offset:2px}',
    '.cs-chat-btn svg{width:22px;height:22px;flex:none}',
    '.cookie-visible .cs-chat-btn{bottom:calc(var(--cookie-h,0px) + 92px)}',
    '.nav-open .cs-chat-btn,.nav-open .cs-chat-panel{display:none}',
    '.cs-chat-panel{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(156px,calc(env(safe-area-inset-bottom) + 140px));z-index:160;display:none;flex-direction:column;width:min(380px,calc(100vw - 32px));height:min(520px,calc(100vh - 190px));background:var(--surface,#161618);color:var(--text,#F5F3EE);border:1px solid var(--line-2,rgba(255,255,255,.17));border-radius:18px;box-shadow:0 24px 60px -12px rgba(0,0,0,.7);overflow:hidden;font:400 .95rem/1.5 var(--ff-body,system-ui,sans-serif)}',
    '.cs-chat-panel.is-open{display:flex}',
    '.cookie-visible .cs-chat-panel{bottom:calc(var(--cookie-h,0px) + 156px);height:min(520px,calc(100vh - var(--cookie-h,0px) - 190px))}',
    '.cs-chat-head{display:flex;align-items:center;gap:.75rem;padding:14px 16px;background:var(--accent,#F7BC0A);color:var(--accent-ink,#0B0B0C)}',
    '.cs-chat-head strong{display:block;font-size:1rem;line-height:1.2}',
    '.cs-chat-head small{display:block;font-size:.78rem;opacity:.8}',
    '.cs-chat-head button{margin-left:auto;width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.12);color:inherit;font-size:1.3rem;line-height:1;cursor:pointer}',
    '.cs-chat-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}',
    '.cs-msg{max-width:86%;padding:10px 13px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}',
    '.cs-msg a{color:var(--accent-2,#FFCB2E)}',
    '.cs-bot{align-self:flex-start;background:var(--surface-2,#1F1F22);border-bottom-left-radius:4px}',
    '.cs-me{align-self:flex-end;background:var(--accent,#F7BC0A);color:var(--accent-ink,#0B0B0C);border-bottom-right-radius:4px}',
    '.cs-opts{display:flex;flex-wrap:wrap;gap:8px}',
    '.cs-opts button,.cs-link{padding:8px 13px;border:1px solid var(--accent,#F7BC0A);border-radius:999px;background:transparent;color:var(--accent-2,#FFCB2E);font:600 .88rem/1.2 inherit;cursor:pointer;text-decoration:none;display:inline-block}',
    '.cs-opts button:hover,.cs-link:hover{background:var(--accent,#F7BC0A);color:var(--accent-ink,#0B0B0C)}',
    '.cs-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,rgba(255,255,255,.09))}',
    '.cs-form input{flex:1;min-width:0;padding:11px 13px;border:1px solid var(--line-2,rgba(255,255,255,.17));border-radius:12px;background:var(--bg,#0B0B0C);color:inherit;font:inherit}',
    '.cs-form button{padding:0 16px;border:0;border-radius:12px;background:var(--accent,#F7BC0A);color:var(--accent-ink,#0B0B0C);font:700 .9rem/1 inherit;cursor:pointer}',
    '.cs-form[hidden]{display:none}',
    '.cs-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}',
    '@media (max-width:480px){.cs-chat-panel{right:8px;left:8px;width:auto;bottom:8px;height:calc(100vh - 16px);height:calc(100dvh - 16px)}.cookie-visible .cs-chat-panel{bottom:8px;height:calc(100dvh - 16px)}.cs-chat-btn span{display:none}.cs-chat-btn{width:52px;padding:0;justify-content:center}}',
    '@media print{.cs-chat-btn,.cs-chat-panel{display:none!important}}',
    '@media (prefers-reduced-motion:reduce){.cs-chat-btn{transition:none}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- DOM ---------- */
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }
  var btn = el('button', { type: 'button', 'class': 'cs-chat-btn', 'aria-expanded': 'false', 'aria-controls': 'cs-chat-panel' });
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  btn.appendChild(el('span', null, t.open));
  btn.setAttribute('aria-label', t.open);

  var panel = el('section', { 'class': 'cs-chat-panel', id: 'cs-chat-panel', role: 'dialog', 'aria-label': t.title });
  var head = el('div', { 'class': 'cs-chat-head' });
  var headText = el('div');
  headText.appendChild(el('strong', null, t.title));
  headText.appendChild(el('small', null, t.status));
  var closeBtn = el('button', { type: 'button', 'aria-label': t.close }, '×');
  head.appendChild(headText); head.appendChild(closeBtn);
  var log = el('div', { 'class': 'cs-chat-log', 'aria-live': 'polite' });
  var form = el('form', { 'class': 'cs-form', novalidate: '' });
  var input = el('input', { type: 'text', maxlength: '1000', placeholder: t.ph, 'aria-label': t.ph, autocomplete: 'off' });
  var hp = el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true', 'class': 'cs-hp' });
  var submit = el('button', { type: 'submit' }, sendLabel());
  form.appendChild(input); form.appendChild(hp); form.appendChild(submit);
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(form);
  document.body.appendChild(btn);
  document.body.appendChild(panel);

  /* ---------- Gesprächslogik ---------- */
  var data, step, startedAt, started = false;

  function scroll() { log.scrollTop = log.scrollHeight; }
  function bot(text, node) {
    var m = el('div', { 'class': 'cs-msg cs-bot' });
    if (text) m.appendChild(document.createTextNode(text));
    if (node) m.appendChild(node);
    log.appendChild(m); scroll(); return m;
  }
  function me(text) { log.appendChild(el('div', { 'class': 'cs-msg cs-me' }, text)); scroll(); }
  function options(list, handler) {
    var box = el('div', { 'class': 'cs-opts' });
    list.forEach(function (label) {
      var b = el('button', { type: 'button' }, label);
      b.addEventListener('click', function () { box.remove(); me(label); handler(label); });
      box.appendChild(b);
    });
    log.appendChild(box); scroll();
  }
  function showInput(on) { form.hidden = !on; if (on) setTimeout(function () { input.focus(); }, 50); }

  function reset() {
    data = { topic: '', name: '', contact: '', message: '' };
    step = 'topic'; startedAt = Date.now();
    log.innerHTML = '';
    showInput(false);
    bot(t.greet);
    options(t.topics, function (topic) {
      data.topic = topic; step = 'name';
      bot(t.askName); showInput(true);
    });
  }

  function validContact(v) {
    var email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var digits = v.replace(/\D/g, '');
    var phone = /^[+()\d\s\-./]+$/.test(v) && digits.length >= 6 && digits.length <= 15;
    return email || phone;
  }

  function askConsent() {
    step = 'consent'; showInput(false);
    var a = el('a', { href: t.privacyUrl, target: '_blank', rel: 'noopener' }, t.privacy);
    var m = bot(t.consent + ' ');
    m.appendChild(a); m.appendChild(document.createTextNode('.'));
    var box = el('div', { 'class': 'cs-opts' });
    var yes = el('button', { type: 'button' }, t.yes), no = el('button', { type: 'button' }, t.no);
    yes.addEventListener('click', function () { box.remove(); me(t.yes); doSend(); });
    no.addEventListener('click', function () { box.remove(); me(t.no); bot(t.cancelled); restartBtn(); });
    box.appendChild(yes); box.appendChild(no); log.appendChild(box); scroll();
  }

  function restartBtn() {
    var box = el('div', { 'class': 'cs-opts' });
    var b = el('button', { type: 'button' }, t.restart);
    b.addEventListener('click', function () { box.remove(); reset(); });
    box.appendChild(b); log.appendChild(box); scroll(); step = 'done';
  }

  function doSend() {
    step = 'sending';
    var wait = bot(t.sending);
    var payload = { lang: lang, topic: data.topic, name: data.name, contact: data.contact, message: data.message, website: hp.value, elapsed: Date.now() - startedAt, page: location.pathname };
    var timeout = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = timeout && setTimeout(function () { timeout.abort(); }, 15000);
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: timeout ? timeout.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); wait.remove(); bot(t.ok.replace('{name}', data.name)); step = 'done'; })
      .catch(function () {
        wait.remove();
        var a = el('a', { 'class': 'cs-link', href: 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(t.waText), target: '_blank', rel: 'noopener' }, t.wa);
        var m = bot(t.err + ' '); m.appendChild(a); step = 'done';
      })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    if (step === 'name') {
      me(v); input.value = ''; data.name = v.slice(0, 80); step = 'contact'; bot(t.askContact);
    } else if (step === 'contact') {
      me(v); input.value = '';
      if (!validContact(v)) { bot(t.badContact); return; }
      data.contact = v.slice(0, 120); step = 'message'; bot(t.askMsg);
    } else if (step === 'message') {
      if (v.length < 5) { me(v); input.value = ''; bot(t.tooShort); return; }
      me(v); input.value = ''; data.message = v.slice(0, 1000); askConsent();
    }
  });

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    if (open) {
      if (!started) { started = true; reset(); }
      else if (!form.hidden) input.focus();
    } else btn.focus();
  }
  btn.addEventListener('click', function () { setOpen(!panel.classList.contains('is-open')); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false); });
})();
