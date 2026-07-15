import type { ImageStorageBucket } from "@/lib/supabase/storage/image-upload";

export type AdminImageUploadState = {
  ok: boolean;
  message: string;
  publicUrl?: string;
  path?: string;
  bucket?: ImageStorageBucket;
};

export const initialAdminImageUploadState: AdminImageUploadState = {
  ok: false,
  message: "",
};
