# IOLSTAR Dashboard

Ürün, sipariş, fatura ve kapasite takip paneli. GitHub Pages üzerinde statik olarak çalışır.

## Güvenlik
- Veri `data/vault.json` içinde **şifreli** tutulur (AES-GCM, anahtar: PBKDF2-SHA256, 600.000 tur).
- Repo herkese açık olsa da şifre olmadan veri okunamaz.
- Uzun ve benzersiz bir şifre kullanın, parola yöneticisinde saklayın.

## Kullanım
1. Sayfayı açıp şifrenizi girin.
2. Değişiklikler bu tarayıcıda şifreli olarak saklanır.
3. Diğer cihazlara veya repoya yansıtmak için **Yedek indir**'e basın ve inen `vault.json` dosyasını `data/vault.json` ile değiştirip commit edin.
4. Şifreyi üst çubuktaki **Şifremi değiştir** ile değiştirin. Ardından yeni `vault.json` dosyasını indirip repoya yükleyin. Eski şifre artık çalışmaz.

## Araçlar (Node.js 19+)
```bash
node tools/decrypt-vault.mjs "sifre" > veri.json      # veriyi çöz
node tools/make-vault.mjs "sifre" veri.json           # yeni şifreyle yeniden şifrele
```
`veri.json` düz metin içerir; işinizi bitirince silin.
