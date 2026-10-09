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

  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return json(500, { error: 'config' });

  const text = [
    '💬 Neue Anfrage (Website-Chat)',
    `Thema: ${topic || '-'}`,
    `Name: ${name}`,
    `Kontakt: ${contact}`,
    `Sprache: ${LANGS[b.lang] || clean(b.lang, 5)}`,
    '',
    message,
  ].join('\n');

  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', process.env.WHATSAPP_PHONE || DEFAULT_PHONE);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apikey);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return json(502, { error: 'upstream' });
    return json(200, { ok: true });
  } catch (e) {
    return json(502, { error: 'upstream' });
  }
};
