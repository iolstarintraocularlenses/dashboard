// Kullanım: node tools/inbox-add.mjs <kayitlar.json>
// Gmail'den hazırlanan sipariş/fatura kayıtlarını panelin açık anahtarıyla şifreler ve
// data/inbox.json dosyasına ekler. Panel şifresi gerekmez; kayıtlar yalnızca panelde
// (şifreyle giriş yapıldığında) çözülebilir ve onaylanınca panele işlenir.
//
// kayitlar.json: [{ kind: "order"|"invoice", key?: "...",
//   gmail: { messageId, subject, date },
//   summary?: "kısa açıklama", warnings?: ["kontrol edilmesi gerekenler"],
//   order?: { customer, country, ref, orderDate, requestedDate, status, priority,
//             amount, currency, note, source,
//             items: [{ brand, model, power?, color?, cyl?, qty }] },
//   invoice?: { no, customer, orderRef?, amount, currency, issueDate, dueDate,
//               paid?, paidDate?, source } }]
// Çıkış kodu: 0 = tamam, 2 = panel henüz açık anahtar yayınlamamış.
import { webcrypto as crypto, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [, , file, vaultPath = 'data/vault.json', inboxPath = 'data/inbox.json'] = process.argv;
if (!file) { console.error('Kullanım: node tools/inbox-add.mjs <kayitlar.json>'); process.exit(1); }

const vault = JSON.parse(readFileSync(vaultPath, 'utf8'));
if (!vault.pub) {
  console.error('Panelin açık anahtarı yok (data/vault.json içinde "pub" alanı). Panele bir kez giriş yapılıp bulut senkron açılmalı.');
  process.exit(2);
}
const entries = JSON.parse(readFileSync(file, 'utf8'));
const inbox = existsSync(inboxPath) ? JSON.parse(readFileSync(inboxPath, 'utf8')) : { v: 1, items: [] };
inbox.items = inbox.items || [];

const b64 = (u) => Buffer.from(u).toString('base64');
const pub = await crypto.subtle.importKey('jwk', vault.pub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
const cutoff = Date.now() - 120 * 864e5;
inbox.items = inbox.items.filter((x) => Date.parse(x.created) > cutoff);

let added = 0, skipped = 0;
for (const e of entries) {
  if (!e.kind || !e.gmail || !e.gmail.messageId) throw new Error('Her kayıtta kind ve gmail.messageId olmalı');
  const id = createHash('sha256').update([e.gmail.messageId, e.kind, e.key || ''].join('|')).digest('hex').slice(0, 16);
  if (inbox.items.some((x) => x.id === id)) { skipped++; continue; }
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'ECDH', public: pub }, eph.privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(e)));
  inbox.items.push({ id, created: new Date().toISOString(), epk: await crypto.subtle.exportKey('jwk', eph.publicKey), iv: b64(iv), ct: b64(ct) });
  added++;
}
inbox.updated = new Date().toISOString();
writeFileSync(inboxPath, JSON.stringify(inbox, null, 2) + '\n');
console.log(`${added} kayıt eklendi, ${skipped} kayıt zaten vardı.`);
