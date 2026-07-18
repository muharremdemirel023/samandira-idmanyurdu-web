import "server-only";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export function isAdminUser(user: User | null | undefined) {
  return user?.app_metadata?.role === "admin";
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !isAdminUser(user)) {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }

  return { supabase, user };
}
