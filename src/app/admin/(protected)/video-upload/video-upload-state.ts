export type AdminVideoUploadState = {
  ok: boolean;
  message: string;
  publicUrl?: string;
  path?: string;
};

export const initialAdminVideoUploadState: AdminVideoUploadState = {
  ok: false,
  message: "",
};
