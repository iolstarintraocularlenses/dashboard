// Kullanım: node tools/make-vault.mjs <sifre> <veri.json> [cikti=data/vault.json]
// Veriyi AES-GCM ile şifreler (anahtar: PBKDF2-SHA256, 600.000 tur).
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [, , pass, dataFile, out = 'data/vault.json'] = process.argv;
if (!pass || !dataFile) {
  console.error('Kullanım: node tools/make-vault.mjs <sifre> <veri.json> [cikti]');
  process.exit(1);
}
const ITER = 600000;
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(readFileSync(dataFile, 'utf8')));
const b64 = (u) => Buffer.from(u).toString('base64');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({
  v: 1, salt: b64(salt), iter: ITER, iv: b64(iv), ct: b64(ct), updated: new Date().toISOString()
}, null, 2) + '\n');
console.log(out + ' yazıldı');
