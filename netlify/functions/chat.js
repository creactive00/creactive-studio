// Netlify Function: nimmt Chat-Anfragen entgegen und leitet sie per CallMeBot an WhatsApp weiter.
// Benötigte Umgebungsvariablen (Netlify → Project configuration → Environment variables):
//   CALLMEBOT_APIKEY  – API-Key von CallMeBot (geheim, nie im Code ablegen)
//   WHATSAPP_PHONE    – optional, Zielnummer mit Landesvorwahl (Standard: +38972600308)

const DEFAULT_PHONE = '+38972600308';
const ALLOWED_HOSTS = /^(www\.)?creactive-studio\.com$|^[a-z0-9-]+\.netlify\.app$|^localhost$/;
const LANGS = { sq: 'Albanisch', mk: 'Mazedonisch', de: 'Deutsch', en: 'Englisch' };

// einfache Begrenzung pro Instanz: max. 5 Anfragen je IP in 10 Minuten
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) hits.clear();
  return list.length > 5;
}

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });

  const origin = event.headers.origin || event.headers.referer || '';
  try {
    if (!ALLOWED_HOSTS.test(new URL(origin).hostname)) return json(403, { error: 'origin' });
  } catch (e) {
    return json(403, { error: 'origin' });
  }

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'json' }); }

  // Bot-Schutz: Honeypot-Feld und zu schnelle Antworten
  if (b.website || Number(b.elapsed) < 3000) return json(200, { ok: true });

  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (limited(ip)) return json(429, { error: 'rate' });

  const name = clean(b.name, 80);
  const contact = clean(b.contact, 120);
  const topic = clean(b.topic, 60);
  const message = clean(b.message, 1000);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
  const digits = contact.replace(/\D/g, '');
  const isPhone = /^[+()\d\s\-./]+$/.test(contact) && digits.length >= 6 && digits.length <= 15;
  if (!name || message.length < 5 || !(isEmail || isPhone)) return json(400, { error: 'invalid' });

  const lang = LANGS[b.lang] || clean(b.lang, 5);

  // 1) E-Mail: als Netlify-Forms-Eintrag (Formular "chat" in /chat-form.html);
  //    die Weiterleitung per E-Mail wird in Netlify unter Notifications eingerichtet.
  const formUrl = (process.env.URL || `https://${new URL(origin).hostname}`) + '/';
  const sendForm = async () => {
    const res = await fetch(formUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'chat', 'bot-field': '', topic, name, contact, lang, message, page: clean(b.page, 200),
      }).toString(),
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    // Netlify Forms antwortet mit 200 oder 303; 301/308 würden den POST verwerfen
    if (![200, 302, 303].includes(res.status)) throw new Error('form ' + res.status);
  };

  // 2) WhatsApp über CallMeBot (nur wenn CALLMEBOT_APIKEY gesetzt ist)
  const apikey = process.env.CALLMEBOT_APIKEY;
  const sendWhatsapp = async () => {
    if (!apikey) throw new Error('no apikey');
    const text = [
      '💬 Neue Anfrage (Website-Chat)',
      `Thema: ${topic || '-'}`,
      `Name: ${name}`,
      `Kontakt: ${contact}`,
      `Sprache: ${lang}`,
      '',
      message,
    ].join('\n');
    const url = new URL('https://api.callmebot.com/whatsapp.php');
    url.searchParams.set('phone', process.env.WHATSAPP_PHONE || DEFAULT_PHONE);
    url.searchParams.set('text', text);
    url.searchParams.set('apikey', apikey);
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('callmebot ' + res.status);
  };

  const results = await Promise.allSettled([sendForm(), sendWhatsapp()]);
  results.forEach((r, i) => { if (r.status === 'rejected') console.error(i === 0 ? 'form' : 'whatsapp', r.reason && r.reason.message); });
  return results.some((r) => r.status === 'fulfilled') ? json(200, { ok: true }) : json(502, { error: 'upstream' });
};
