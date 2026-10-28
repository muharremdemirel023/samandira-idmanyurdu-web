import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  PARENT_SESSION_COOKIE,
  PARENT_SESSION_META_COOKIE,
} from "@/lib/auth/parent-session-constants";

export { PARENT_SESSION_COOKIE, PARENT_SESSION_META_COOKIE };

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gün

export type ParentSessionMeta = {
  parentName: string | null;
  phone: string | null;
};

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getParentAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARENT_SESSION_COOKIE)?.value?.trim();
  return token || null;
}

export async function getParentSessionMeta(): Promise<ParentSessionMeta | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PARENT_SESSION_META_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ParentSessionMeta;
    return {
      parentName: typeof parsed.parentName === "string" ? parsed.parentName : null,
      phone: typeof parsed.phone === "string" ? parsed.phone : null,
    };
  } catch {
    return null;
  }
}

export async function hasParentSession(): Promise<boolean> {
  return Boolean(await getParentAccessToken());
}

export async function setParentSession(
  accessToken: string,
  meta: ParentSessionMeta,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PARENT_SESSION_COOKIE, accessToken, sessionCookieOptions());
  cookieStore.set(
    PARENT_SESSION_META_COOKIE,
    JSON.stringify({
      parentName: meta.parentName,
      phone: meta.phone,
    }),
    sessionCookieOptions(),
  );
}

export async function clearParentSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PARENT_SESSION_COOKIE, "", sessionCookieOptions(0));
  cookieStore.set(PARENT_SESSION_META_COOKIE, "", sessionCookieOptions(0));
}

export async function requireParentSession() {
  const accessToken = await getParentAccessToken();
  if (!accessToken) {
    redirect("/veli/login?error=unauthorized");
  }

  const meta = (await getParentSessionMeta()) ?? { parentName: null, phone: null };
  return { accessToken, meta };
}
