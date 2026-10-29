import "server-only";

const akademiProSupabaseUrl = process.env.AKADEMI_PRO_SUPABASE_URL?.replace(/\/$/, "");
const akademiProAnonKey = process.env.AKADEMI_PRO_ANON_KEY;
const akademiProOrganizationId = process.env.AKADEMI_PRO_ORGANIZATION_ID?.trim().toLowerCase();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Bu sitenin Akademi Pro'daki organizasyonu (Samandıra). Veli paneli yalnızca
 * bu organizasyonun öğrencilerini gösterir. Değer yalnızca sunucu ortam
 * değişkeninden okunur; tanımlı veya geçerli değilse null döner ve panel
 * öğrenci göstermez.
 */
export function getAkademiProOrganizationId(): string | null {
  return akademiProOrganizationId && UUID_PATTERN.test(akademiProOrganizationId)
    ? akademiProOrganizationId
    : null;
}

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
