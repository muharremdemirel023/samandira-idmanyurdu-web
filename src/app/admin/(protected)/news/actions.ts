"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createSlug } from "@/lib/slug";

type NewsPayload = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  is_active: boolean;
};

function readNewsPayload(formData: FormData): NewsPayload {
  const title = String(formData.get("title") || "").trim();
  const requestedSlug = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") || "").trim();

  if (!title) {
    throw new Error("Başlık zorunludur.");
  }

  // Elle girilen slug da URL-uyumlu hale getirilir (Türkçe karakterler, boşluk, büyük harf vb. temizlenir).
  const slug = createSlug(requestedSlug || title) || createSlug(title);

  return {
    title,
    slug,
    summary,
    content,
    cover_image_url: coverImageUrl || null,
    is_active: formData.get("is_active") === "on",
  };
}

/** Public sayfalarda ilgili duyurunun her yerde güncel görünmesi için gereken tüm yolları yeniler. */
function revalidateNewsPaths(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/duyurular");
  if (slug) {
    revalidatePath(`/duyurular/${slug}`);
  }
  revalidatePath("/admin/news");
}

async function getNewsSlug(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("news").select("slug").eq("id", id).maybeSingle();
  return data?.slug ?? null;
}

export async function createNews(formData: FormData) {
  const supabase = await createClient();
  const payload = readNewsPayload(formData);

  const { error } = await supabase.from("news").insert(payload);

  if (error) {
    throw new Error("Duyuru kaydedilemedi.");
  }

  revalidateNewsPaths(payload.slug);
  redirect("/admin/news");
}

export async function updateNews(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = readNewsPayload(formData);
  const previousSlug = await getNewsSlug(id);

  const { error } = await supabase.from("news").update(payload).eq("id", id);

  if (error) {
    throw new Error("Duyuru güncellenemedi.");
  }

  revalidateNewsPaths(payload.slug);
  if (previousSlug && previousSlug !== payload.slug) {
    revalidatePath(`/duyurular/${previousSlug}`);
  }
  revalidatePath(`/admin/news/${id}`);
  redirect("/admin/news");
}

export async function deleteNews(id: string) {
  const supabase = await createClient();
  const slug = await getNewsSlug(id);

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    throw new Error("Duyuru silinemedi.");
  }

  revalidateNewsPaths(slug);
  redirect("/admin/news");
}

export async function setNewsPublished(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const slug = await getNewsSlug(id);

  const { error } = await supabase
    .from("news")
    .update({ is_active: isPublished })
    .eq("id", id);

  if (error) {
    throw new Error("Duyuru yayın durumu güncellenemedi.");
  }

  revalidateNewsPaths(slug);
  revalidatePath(`/admin/news/${id}`);
}
