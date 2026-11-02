import { createHash, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { runTffSync } from "@/lib/tff/sync";

export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" };

// Vercel Cron, CRON_SECRET tanımlıysa isteğe "Authorization: Bearer <secret>" ekler.
function isAuthorized(request: NextRequest, secret: string) {
  const received = createHash("sha256").update(request.headers.get("authorization") ?? "").digest();
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(received, expected);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) {
    console.error("[tff-sync] CRON_SECRET tanımlı değil veya 16 karakterden kısa.");
    return Response.json({ ok: false, error: "Senkronizasyon yapılandırılmamış." }, { status: 503, headers: noStore });
  }
  if (!isAuthorized(request, secret)) {
    return Response.json({ ok: false, error: "Yetkisiz." }, { status: 401, headers: noStore });
  }

  const params = request.nextUrl.searchParams;
  const seasonParam = params.get("season");
  if (seasonParam !== null && !/^\d{1,4}$/.test(seasonParam)) {
    return Response.json({ ok: false, error: "Geçersiz sezon." }, { status: 400, headers: noStore });
  }

  try {
    const result = await runTffSync({
      trigger: request.headers.get("user-agent")?.startsWith("vercel-cron") ? "cron" : "manual",
      seasonId: seasonParam === null ? undefined : Number(seasonParam),
      force: params.get("force") === "1",
    });
    return Response.json(result, { status: result.status === "failed" ? 500 : 200, headers: noStore });
  } catch (error) {
    console.error("[tff-sync] Senkronizasyon başlatılamadı", error);
    return Response.json({ ok: false, error: "Senkronizasyon başlatılamadı." }, { status: 500, headers: noStore });
  }
}
