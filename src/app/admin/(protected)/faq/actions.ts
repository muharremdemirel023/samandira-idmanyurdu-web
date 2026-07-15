"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateFaqs() {
  revalidatePath("/admin/faq");
  revalidatePath("/akademi/sik-sorulan-sorular");
  revalidatePath("/");
}

function readPayload(formData: FormData) {
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") || "0"), 10);

  if (!question || !answer) {
    throw new Error("Soru ve cevap zorunludur.");
  }

  return {
    question,
    answer,
    category: category || null,
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createFaq(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert(readPayload(formData));

  if (error) {
    throw new Error("Soru kaydedilemedi.");
  }

  revalidateFaqs();
}

export async function updateFaq(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update(readPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Soru güncellenemedi.");
  }

  revalidateFaqs();
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    throw new Error("Soru silinemedi.");
  }

  revalidateFaqs();
}
