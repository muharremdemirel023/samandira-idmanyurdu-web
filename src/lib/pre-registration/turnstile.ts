import "server-only";

type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstile(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const configuredRequirement = process.env.PRE_REGISTRATION_REQUIRE_TURNSTILE;
  const required = configuredRequirement
    ? configuredRequirement === "true"
    : process.env.NODE_ENV === "production";

  if (!secret) {
    return required
      ? { success: false, reason: "Turnstile yapılandırması eksik." }
      : { success: true };
  }

  if (!token) {
    return { success: false, reason: "Lütfen güvenlik doğrulamasını tamamlayın." };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        signal: AbortSignal.timeout(6_000),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { success: false, reason: "Güvenlik doğrulaması şu anda kullanılamıyor." };
    }

    const result = (await response.json()) as TurnstileResponse;
    return result.success
      ? { success: true }
      : { success: false, reason: "Güvenlik doğrulaması başarısız oldu." };
  } catch {
    return { success: false, reason: "Güvenlik doğrulaması zaman aşımına uğradı." };
  }
}
