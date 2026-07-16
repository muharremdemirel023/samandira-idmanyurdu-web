"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createSlug } from "@/lib/slug";

type CustomPagePayload = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  is_active: boolean;
  show_in_menu: boolean;
  show_in_footer: boolean;
  sort_order: number;
};

function readCustomPagePayload(formData: FormData): CustomPagePayload {
  const title = String(formData.get("title") || "").trim();
  const requestedSlug = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") || "").trim();
  const sortOrderRaw = Number.parseInt(String(formData.get("sort_order") || ""), 10);

  if (!title) {
    throw new Error("Başlık zorunludur.");
  }

  const slug = createSlug(requestedSlug || title) || createSlug(title);

  if (!slug) {
    throw new Error("Geçerli bir bağlantı adı gerekli.");
  }

  return {
    title,
    slug,
    summary,
    content,
    cover_image_url: coverImageUrl || null,
    is_active: formData.get("is_active") === "on",
    show_in_menu: formData.get("show_in_menu") === "on",
    show_in_footer: formData.get("show_in_footer") === "on",
    sort_order: Number.isNaN(sortOrderRaw) ? 0 : sortOrderRaw,
  };
}

function revalidateCustomPagePaths(slug?: string | null) {
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  if (slug) {
    revalidatePath(`/sayfa/${slug}`);
  }
}

async function getCustomPageSlug(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("custom_pages").select("slug").eq("id", id).maybeSingle();
  return data?.slug ?? null;
}

export async function createCustomPage(formData: FormData) {
  const supabase = await createClient();
  const payload = readCustomPagePayload(formData);

  const { error } = await supabase.from("custom_pages").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505" ? "Bu bağlantı adı zaten kullanılıyor." : "Sayfa kaydedilemedi.",
    );
  }

  revalidateCustomPagePaths(payload.slug);
  redirect("/admin/pages");
}

export async function updateCustomPage(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = readCustomPagePayload(formData);
  const previousSlug = await getCustomPageSlug(id);

  const { error } = await supabase.from("custom_pages").update(payload).eq("id", id);

  if (error) {
    throw new Error(
      error.code === "23505" ? "Bu bağlantı adı zaten kullanılıyor." : "Sayfa güncellenemedi.",
    );
  }

  revalidateCustomPagePaths(payload.slug);
  if (previousSlug && previousSlug !== payload.slug) {
    revalidatePath(`/sayfa/${previousSlug}`);
  }
  revalidatePath(`/admin/pages/${id}`);
  redirect("/admin/pages");
}

export async function deleteCustomPage(id: string) {
  const supabase = await createClient();
  const slug = await getCustomPageSlug(id);

  const { error } = await supabase.from("custom_pages").delete().eq("id", id);

  if (error) {
    throw new Error("Sayfa silinemedi.");
  }

  revalidateCustomPagePaths(slug);
  redirect("/admin/pages");
}

export async function setCustomPagePublished(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const slug = await getCustomPageSlug(id);

  const { error } = await supabase
    .from("custom_pages")
    .update({ is_active: isPublished })
    .eq("id", id);

  if (error) {
    throw new Error("Sayfa yayın durumu güncellenemedi.");
  }

  revalidateCustomPagePaths(slug);
  revalidatePath(`/admin/pages/${id}`);
}
