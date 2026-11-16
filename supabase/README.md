# Supabase kurulumu

1. https://supabase.com adresinde yeni bir proje açın.
2. **SQL Editor**'de `schema.sql` dosyasının içeriğini yapıştırıp çalıştırın.
3. **Authentication > Users > Add user** ile her kişi için e-posta ve şifre oluşturun.
4. **Table Editor > profiles** tablosunda kişinin satırını bulun:
   - `active` = true
   - `role` = `admin` (yazma yetkisi) veya `viewer` (yalnızca okuma)
5. Bana şunları gönderin (ikisi de herkese açık bilgidir):
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon / publishable key**

Asla `service_role` anahtarını veya veritabanı şifresini paylaşmayın.
