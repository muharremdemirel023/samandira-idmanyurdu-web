import "server-only";

import { tffSourceConfig } from "@/config/tff";
import { TffSyncError } from "@/lib/tff/errors";
import { parseRobots, type RobotsRules } from "@/lib/tff/robots";

// F5/WAF ret sayfalarının tipik metni; bu durumda yeniden denenmez.
const BLOCK_PAGE_PATTERN = /Request Rejected|support ID is/i;

/**
 * TFF İstanbul'a giden tüm istekler buradan geçer: robots.txt denetimi,
 * açık istemci kimliği, istekler arası bekleme, zaman aşımı ve boyut sınırı.
 * Yönlendirme veya engelleme yanıtları aşılmaya çalışılmaz; hata olarak raporlanır.
 */
export function createTffClient() {
  let robots: RobotsRules | null = null;
  let lastRequestAt = 0;
  let requestCount = 0;

  async function request(path: string, accept: string) {
    const url = new URL(path, tffSourceConfig.origin);
    if (url.origin !== tffSourceConfig.origin) {
      throw new TffSyncError("config_error", `TFF dışı adres istenemez: ${path}`);
    }

    const wait = lastRequestAt + tffSourceConfig.politeDelayMs - Date.now();
    if (lastRequestAt > 0 && wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();
    requestCount += 1;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": tffSourceConfig.userAgent,
          Accept: accept,
          "Accept-Language": "tr-TR,tr;q=0.9",
        },
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(tffSourceConfig.requestTimeoutMs),
      });
    } catch (error) {
      throw new TffSyncError("source_unreachable", `TFF İstanbul'a ulaşılamadı (${url.pathname}).`, {
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > tffSourceConfig.maxResponseBytes) {
      throw new TffSyncError("unexpected_content", `Yanıt beklenenden büyük (${declaredLength} bayt).`);
    }

    return response;
  }

  async function readText(response: Response, path: string) {
    const text = await response.text();
    if (text.length > tffSourceConfig.maxResponseBytes) {
      throw new TffSyncError("unexpected_content", `Yanıt beklenenden büyük (${path}).`);
    }
    return text;
  }

  return {
    get requestCount() {
      return requestCount;
    },

    async loadRobots() {
      const response = await request("/robots.txt", "text/plain");
      if (response.status === 404) {
        robots = parseRobots("", tffSourceConfig.userAgentToken);
        return;
      }
      if (!response.ok) {
        throw new TffSyncError("robots_unavailable", `robots.txt okunamadı (HTTP ${response.status}).`);
      }
      robots = parseRobots(await readText(response, "/robots.txt"), tffSourceConfig.userAgentToken);
    },

    async fetchHtml(path: string) {
      if (!robots) {
        throw new TffSyncError("config_error", "robots.txt yüklenmeden TFF sayfası istenemez.");
      }
      if (!robots.isAllowed(path)) {
        throw new TffSyncError("robots_disallowed", `robots.txt bu yola izin vermiyor: ${path}`);
      }

      const response = await request(path, "text/html");

      if (response.status >= 300 && response.status < 400) {
        throw new TffSyncError("unexpected_content", `Beklenmeyen yönlendirme (HTTP ${response.status}).`, {
          path,
          location: response.headers.get("location"),
        });
      }
      if (response.status === 403 || response.status === 429 || response.status === 503) {
        throw new TffSyncError("source_blocked", `TFF İstanbul isteği kabul etmedi (HTTP ${response.status}).`, {
          path,
          retryAfter: response.headers.get("retry-after"),
        });
      }
      if (!response.ok) {
        throw new TffSyncError("http_error", `TFF İstanbul HTTP ${response.status} döndürdü.`, { path });
      }
      if (!(response.headers.get("content-type") ?? "").includes("text/html")) {
        throw new TffSyncError("unexpected_content", "Yanıt HTML değil.", {
          path,
          contentType: response.headers.get("content-type"),
        });
      }

      const html = await readText(response, path);
      if (BLOCK_PAGE_PATTERN.test(html)) {
        throw new TffSyncError("source_blocked", "TFF İstanbul güvenlik duvarı isteği reddetti.", { path });
      }
      return html;
    },
  };
}
