# Supabase kurulumu (tek kullanıcı)

1. **SQL Editor**'de `schema.sql` dosyasının içeriğini yapıştırıp **Run** deyin.
2. **Authentication → Sign In / Providers** bölümünde **Allow new users to sign up** seçeneğini kapatın.
3. **Authentication → Users → Add user → Create new user** ile:
   - E-posta: `config.js` içindeki `loginEmail` (varsayılan: `panel@iolstar-dashboard.com`)
   - Şifre: panele girmek için kullanacağınız şifre
   - **Auto Confirm User** kutusunu işaretleyin
4. Bana **Project URL** (zaten yazıldı) ve **anon / publishable** anahtarını gönderin. `service_role` anahtarını göndermeyin.

Panelde giriş yalnızca şifre ile yapılır. Şifreyi üst çubuktaki **Şifremi değiştir** ile değiştirebilirsiniz.
