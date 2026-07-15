"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateSchedules() {
  revalidatePath("/admin/training-schedule");
  revalidatePath("/");
}

function readPayload(formData: FormData) {
  const ageGroup = String(formData.get("age_group") || "").trim();
  const days = String(formData.get("days") || "").trim();
  const startTime = String(formData.get("start_time") || "").trim();
  const endTime = String(formData.get("end_time") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") || "0"), 10);

  if (!ageGroup || !days || !startTime || !endTime) {
    throw new Error("Yaş grubu, gün ve saat bilgileri zorunludur.");
  }

  return {
    age_group: ageGroup,
    days,
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    description: description || null,
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createTrainingSchedule(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_schedules").insert(readPayload(formData));

  if (error) {
    throw new Error("Program satırı kaydedilemedi.");
  }

  revalidateSchedules();
}

export async function updateTrainingSchedule(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_schedules")
    .update(readPayload(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Program satırı güncellenemedi.");
  }

  revalidateSchedules();
}

export async function deleteTrainingSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_schedules").delete().eq("id", id);

  if (error) {
    throw new Error("Program satırı silinemedi.");
  }

  revalidateSchedules();
}
