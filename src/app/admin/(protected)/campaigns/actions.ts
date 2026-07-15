"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function revalidateCampaigns() {
  revalidatePath("/admin/campaigns");
  revalidatePath("/");
}

/**
 * <input type="datetime-local"> saat dilimi bilgisi olmadan "YYYY-MM-DDTHH:mm" gönderir.
 * Bu değer İstanbul (Europe/Istanbul, sabit UTC+03:00) yerel saati olarak girildiği için,
 * sunucunun çalıştığı ortamın saat dilimine (genelde UTC) bırakılmadan +03:00 ofseti
 * açıkça belirtilerek doğru UTC ana çevrilir. Aksi halde sunucu bunu UTC sanır ve
 * kampanya başlangıcı gerçekte 3 saat ileriye kayar (henüz başlamamış görünür).
 */
function readOptionalTimestamp(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();
  if (!value) return null;

  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(`${withSeconds}+03:00`).toISOString();
}

function readNumber(formData: FormData, name: string, fallback: number) {
  const value = Number.parseInt(String(formData.get(name) || ""), 10);
  return Number.isNaN(value) ? fallback : value;
}

function readPayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    throw new Error("Kampanya adı zorunludur.");
  }

  return {
    name,
    desktop_image_url: String(formData.get("desktop_image_url") || "").trim() || null,
    mobile_image_url: String(formData.get("mobile_image_url") || "").trim() || null,
    title: String(formData.get("title") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    button_label: String(formData.get("button_label") || "").trim() || null,
    button_href: String(formData.get("button_href") || "").trim() || null,
    is_active: formData.get("is_active") === "on",
    starts_at: readOptionalTimestamp(formData, "starts_at"),
    ends_at: readOptionalTimestamp(formData, "ends_at"),
    open_delay_ms: readNumber(formData, "open_delay_ms", 500),
    auto_close_seconds: readNumber(formData, "auto_close_seconds", 6),
    // -160..80 px: negatif değer mesaj kartını görselin üzerine doğru çeker
    content_gap_px: Math.max(-160, Math.min(80, readNumber(formData, "content_gap_px", 12))),
    show_every_reload: formData.get("show_every_reload") === "on",
    show_once_per_user: formData.get("show_once_per_user") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createCampaign(formData: FormData) {
  let payload: ReturnType<typeof readPayload>;

  try {
    payload = readPayload(formData);
  } catch (error) {
    console.error("[admin/campaigns] Geçersiz form verisi:", error);
    redirect("/admin/campaigns?error=validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").insert(payload);

  if (error) {
    // Ham Supabase hatası kullanıcıya gösterilmez; ayrıntı yalnızca sunucu terminaline yazılır.
    console.error("[admin/campaigns] Kampanya oluşturulamadı:", error);
    redirect("/admin/campaigns?error=create");
  }

  revalidateCampaigns();
  redirect("/admin/campaigns?saved=1");
}

export async function updateCampaign(id: string, formData: FormData) {
  let payload: ReturnType<typeof readPayload>;

  try {
    payload = readPayload(formData);
  } catch (error) {
    console.error("[admin/campaigns] Geçersiz form verisi:", error);
    redirect("/admin/campaigns?error=validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").update(payload).eq("id", id);

  if (error) {
    console.error("[admin/campaigns] Kampanya güncellenemedi:", error);
    redirect("/admin/campaigns?error=update");
  }

  revalidateCampaigns();
  redirect("/admin/campaigns?saved=1");
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    console.error("[admin/campaigns] Kampanya silinemedi:", error);
    redirect("/admin/campaigns?error=delete");
  }

  revalidateCampaigns();
  redirect("/admin/campaigns?saved=1");
}
