// Kullanım: node tools/decrypt-vault.mjs <sifre> [data/vault.json] > veri.json
// Şifreli kasayı çözer (şifre değiştirmek için: çöz -> make-vault ile yeni şifreyle yeniden şifrele)
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

const [, , pass, file = 'data/vault.json'] = process.argv;
if (!pass) { console.error('Kullanım: node tools/decrypt-vault.mjs <sifre> [data/vault.json]'); process.exit(1); }
const v = JSON.parse(readFileSync(file, 'utf8'));
const dec = (t) => Buffer.from(t, 'base64');
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: dec(v.salt), iterations: v.iter, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: dec(v.iv) }, key, dec(v.ct));
process.stdout.write(new TextDecoder().decode(pt));
