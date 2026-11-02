import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Herkese açık (RLS'de anon rolüne açık) veriler için çerezsiz istemci.
 * Ziyaretçi oturumunu okumaz ve yenilemez; tarayıcıdaki süresi dolmuş bir
 * oturum çerezi bu sorgularda Supabase Auth'a token yenileme isteği üretmez.
 * Kullanıcıya özel veya yetki gerektiren sorgularda kullanılmaz.
 */
export function createPublicClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
