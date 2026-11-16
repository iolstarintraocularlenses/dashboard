// Supabase bağlantı bilgileri. Anon (publishable) anahtar herkese açık olabilir;
// güvenlik satır seviyesi kurallarla (supabase/schema.sql) sağlanır.
window.IOLSTAR_CONFIG = {
  supabaseUrl: 'https://nycldfspuxbihrnprjgv.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-KEY',
  // Tek panel hesabının e-postası (kullanıcıya gösterilmez; Supabase'de bu adresle hesap açılır)
  loginEmail: 'panel@iolstar-dashboard.com'
};
