# admin-users fonksiyonu

Supabase Dashboard > **Edge Functions** > **Deploy a new function** > ad: `admin-users`
içine `admin-users/index.ts` dosyasının içeriğini yapıştırıp deploy edin.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` Supabase tarafından otomatik sağlanır; elle girmenize gerek yoktur.

Ayrıca **Authentication > Sign In / Providers** ayarlarında **Allow new users to sign up** seçeneğini kapatın. Böylece herkes kendi kendine hesap açamaz.
