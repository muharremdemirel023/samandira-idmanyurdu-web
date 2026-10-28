import "server-only";

const akademiProSupabaseUrl = process.env.AKADEMI_PRO_SUPABASE_URL?.replace(/\/$/, "");
const akademiProAnonKey = process.env.AKADEMI_PRO_ANON_KEY;

export function getAkademiProConfig() {
  if (!akademiProSupabaseUrl || !akademiProAnonKey) {
    throw new Error(
      "Missing Akademi Pro environment variables. Set AKADEMI_PRO_SUPABASE_URL and AKADEMI_PRO_ANON_KEY.",
    );
  }

  return {
    supabaseUrl: akademiProSupabaseUrl,
    anonKey: akademiProAnonKey,
    parentLoginUrl: `${akademiProSupabaseUrl}/functions/v1/parent-auth/login`,
  };
}

export function hasAkademiProConfig() {
  return Boolean(akademiProSupabaseUrl && akademiProAnonKey);
}
