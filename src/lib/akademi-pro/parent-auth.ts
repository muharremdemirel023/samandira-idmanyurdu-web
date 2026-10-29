import "server-only";

import { getAkademiProConfig } from "@/lib/akademi-pro/config";

export type ParentAuthSuccess = {
  accessToken: string;
  /** Token'ın bitiş anı (Unix saniye); yanıtta yoksa null. */
  expiresAt: number | null;
  parentName: string | null;
  phone: string | null;
};

export type ParentAuthFailure = {
  ok: false;
  reason: "credentials" | "unavailable" | "misconfigured";
  message: string;
};

export type ParentAuthResult =
  | ({ ok: true } & ParentAuthSuccess)
  | ParentAuthFailure;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickAccessToken(payload: UnknownRecord): string | null {
  const direct =
    asString(payload.access_token) ??
    asString(payload.accessToken) ??
    asString(payload.token) ??
    asString(payload.jwt);

  if (direct) return direct;

  const session = asRecord(payload.session);
  if (session) {
    const fromSession =
      asString(session.access_token) ??
      asString(session.accessToken) ??
      asString(session.token);
    if (fromSession) return fromSession;
  }

  const data = asRecord(payload.data);
  if (data) {
    const fromData =
      asString(data.access_token) ??
      asString(data.accessToken) ??
      asString(data.token) ??
      asString(data.jwt);
    if (fromData) return fromData;

    const nestedSession = asRecord(data.session);
    if (nestedSession) {
      return (
        asString(nestedSession.access_token) ??
        asString(nestedSession.accessToken) ??
        asString(nestedSession.token)
      );
    }
  }

  return null;
}

// Akademi Pro parent-auth yanıtı adı { parent: { first_name, last_name } }
// olarak döner; tek alanlı ad biçimleri de desteklenir.
function nameFromRecord(record: UnknownRecord): string | null {
  const fullName =
    asString(record.full_name) ??
    asString(record.fullName) ??
    asString(record.name) ??
    asString(record.display_name) ??
    asString(record.displayName);
  if (fullName) return fullName;

  const parts = [
    asString(record.first_name) ?? asString(record.firstName),
    asString(record.last_name) ?? asString(record.lastName),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function pickParentName(payload: UnknownRecord): string | null {
  const candidates = [payload.parent, payload.user, payload.data, payload];
  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (!record) continue;
    const name = nameFromRecord(record);
    if (name) return name;

    const nestedParent = asRecord(record.parent);
    if (nestedParent) {
      const nestedName = nameFromRecord(nestedParent);
      if (nestedName) return nestedName;
    }
  }
  return null;
}

function pickExpiresAt(payload: UnknownRecord): number | null {
  const value = payload.expires_at ?? asRecord(payload.session)?.expires_at;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pickPhone(payload: UnknownRecord, fallback: string): string | null {
  const candidates = [payload.parent, payload.user, payload.data, payload];
  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (!record) continue;
    const phone = asString(record.phone) ?? asString(record.telefon);
    if (phone) return phone;
  }
  return fallback;
}

/** TR telefonlarını E.164 (+90…) biçimine yaklaştırır; aksi halde temizlenmiş girdiyi döner. */
export function normalizeParentPhone(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return digits || trimmed;
}

export async function loginParentWithAkademiPro(
  phone: string,
  password: string,
): Promise<ParentAuthResult> {
  let config: ReturnType<typeof getAkademiProConfig>;
  try {
    config = getAkademiProConfig();
  } catch {
    return {
      ok: false,
      reason: "misconfigured",
      message: "Veli girişi şu anda yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const normalizedPhone = normalizeParentPhone(phone);

  try {
    const response = await fetch(config.parentLoginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.anonKey}`,
        apikey: config.anonKey,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        password,
      }),
      cache: "no-store",
    });

    let payload: UnknownRecord = {};
    try {
      const json: unknown = await response.json();
      payload = asRecord(json) ?? {};
    } catch {
      payload = {};
    }

    if (!response.ok) {
      const apiMessage =
        asString(payload.message) ??
        asString(payload.error) ??
        asString(asRecord(payload.error)?.message);

      if (response.status === 401 || response.status === 403 || response.status === 400) {
        return {
          ok: false,
          reason: "credentials",
          message: apiMessage ?? "Telefon numarası veya şifre hatalı.",
        };
      }

      console.error("Akademi Pro parent-auth/login failed.", response.status, apiMessage);
      return {
        ok: false,
        reason: "unavailable",
        message: "Giriş servisine ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
      };
    }

    const accessToken = pickAccessToken(payload);
    if (!accessToken) {
      console.error("Akademi Pro parent-auth/login returned no access token.");
      return {
        ok: false,
        reason: "unavailable",
        message: "Giriş yanıtı geçersiz. Lütfen daha sonra tekrar deneyin.",
      };
    }

    return {
      ok: true,
      accessToken,
      expiresAt: pickExpiresAt(payload),
      parentName: pickParentName(payload),
      phone: pickPhone(payload, normalizedPhone),
    };
  } catch (error) {
    console.error("Akademi Pro parent-auth/login request error.", error);
    return {
      ok: false,
      reason: "unavailable",
      message: "Giriş servisine ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
    };
  }
}
