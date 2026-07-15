"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const validStatuses = ["new", "read", "replied", "closed"] as const;

export async function updateContactMessage(id: string, formData: FormData) {
  const supabase = await createClient();

  const statusValue = String(formData.get("status") || "new");
  const status = validStatuses.includes(statusValue as (typeof validStatuses)[number])
    ? statusValue
    : "new";
  const adminNote = String(formData.get("admin_note") || "").trim();

  const { error } = await supabase
    .from("contact_messages")
    .update({ status, admin_note: adminNote || null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error("Mesaj güncellenemedi.");
  }

  revalidatePath("/admin/contact-messages");
}

export async function deleteContactMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);

  if (error) {
    throw new Error("Mesaj silinemedi.");
  }

  revalidatePath("/admin/contact-messages");
}
