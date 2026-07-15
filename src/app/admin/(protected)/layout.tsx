import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell logoutAction={logout}>{children}</AdminShell>;
}
