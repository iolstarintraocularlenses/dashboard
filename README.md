# IOLSTAR Dashboard

Ürün, sipariş, fatura ve kapasite takip paneli. Sayfa GitHub Pages üzerinde statik olarak çalışır.

## Güvenlik modeli
- Veri `data/vault.json` içinde **şifreli** tutulur (AES-GCM, anahtar: PBKDF2-SHA256, 600.000 tur).
- Repo herkese açık olsa da veriler şifre olmadan okunamaz.
- Güçlü bir şifre kullanın ve parola yöneticisinde saklayın. Kısa veya kolay şifreler, şifreli dosya çalınırsa kırılabilir.

## Kullanım
1. Sayfayı açın, kullanıcı adı ve şifrenizle girin.
2. Yaptığınız değişiklikler bu tarayıcıda şifreli olarak saklanır.
3. Diğer cihazlara veya repoya yansıtmak için üst çubuktan **Yedek indir**'e basın. İnen `vault.json` dosyasını repodaki `data/vault.json` ile değiştirip commit edin.

## Şifre değiştirme / veri çözme
```bash
node tools/decrypt-vault.mjs "eski-sifre" > veri.json
node tools/make-vault.mjs iolstar "yeni-sifre" veri.json
```
Ardından `data/vault.json` dosyasını commit edin. `veri.json` dosyasını silin; düz metin veri içerir.
