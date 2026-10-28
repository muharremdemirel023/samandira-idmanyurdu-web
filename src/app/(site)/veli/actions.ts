"use server";

import { redirect } from "next/navigation";

import { loginParentWithAkademiPro } from "@/lib/akademi-pro/parent-auth";
import {
  clearParentSession,
  setParentSession,
} from "@/lib/auth/parent-session";

export async function parentLogin(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!phone || !password) {
    redirect("/veli/login?error=credentials");
  }

  const result = await loginParentWithAkademiPro(phone, password);

  if (!result.ok) {
    redirect(`/veli/login?error=${result.reason}`);
  }

  await setParentSession(result.accessToken, {
    parentName: result.parentName,
    phone: result.phone,
  });

  redirect("/veli/dashboard");
}

export async function parentLogout() {
  await clearParentSession();
  redirect("/veli/login");
}
