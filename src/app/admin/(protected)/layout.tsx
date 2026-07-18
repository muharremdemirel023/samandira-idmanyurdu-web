import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { AdminPreRegistrationRefresh } from "@/components/admin/AdminPreRegistrationRefresh";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Yönetim Paneli" };
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) redirect("/admin/login?error=unauthorized");

  return (
    <AdminShell logoutAction={logout}>
      <AdminPreRegistrationRefresh />
      {children}
    </AdminShell>
  );
}
