import { redirect } from "next/navigation";

/** Eski bağlantılar için: site ayarları artık /admin/settings altında. */
export default function AdminSiteSettingsPage() {
  redirect("/admin/settings");
}
