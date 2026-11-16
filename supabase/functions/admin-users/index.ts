// Yönetici işlemleri: hesap oluşturma, şifre sıfırlama, hesap silme.
// Service role anahtarı yalnızca bu fonksiyonda (sunucuda) kullanılır.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Çağıranın kimliği (kullanıcının kendi JWT'si ile)
  const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: au } = await caller.auth.getUser();
  if (!au?.user) return json({ error: 'Oturum geçersiz.' }, 401);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: me } = await admin.from('profiles').select('role,active').eq('id', au.user.id).single();
  if (!me || !me.active || me.role !== 'admin') return json({ error: 'Bu işlem için yönetici olmalısınız.' }, 403);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek.' }, 400); }
  const action = body?.action;

  if (action === 'create') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role === 'admin' ? 'admin' : 'viewer';
    if (!EMAIL.test(email)) return json({ error: 'Geçerli bir e-posta girin.' }, 400);
    if (password.length < 10) return json({ error: 'Şifre en az 10 karakter olmalı.' }, 400);
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return json({ error: error.message }, 400);
    await admin.from('profiles').update({ role, active: true }).eq('id', data.user!.id);
    return json({ ok: true });
  }

  if (action === 'reset') {
    const userId = String(body.userId || '');
    const password = String(body.password || '');
    if (!UUID.test(userId)) return json({ error: 'Geçersiz kullanıcı.' }, 400);
    if (password.length < 10) return json({ error: 'Şifre en az 10 karakter olmalı.' }, 400);
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === 'delete') {
    const userId = String(body.userId || '');
    if (!UUID.test(userId)) return json({ error: 'Geçersiz kullanıcı.' }, 400);
    if (userId === au.user.id) return json({ error: 'Kendi hesabınızı silemezsiniz.' }, 400);
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Bilinmeyen işlem.' }, 400);
});
