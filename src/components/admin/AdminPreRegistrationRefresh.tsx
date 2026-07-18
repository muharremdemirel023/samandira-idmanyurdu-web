"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export function AdminPreRegistrationRefresh() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const watchesPreRegistrations =
      pathname === "/admin" || pathname.startsWith("/admin/pre-registrations");
    if (!watchesPreRegistrations) return;

    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase
      .channel("admin-pre-registration-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pre_registrations" },
        scheduleRefresh,
      )
      .subscribe();

    // Realtime bağlantısı kesilirse açık ekranın tamamen bayat kalmaması için yedek yenileme.
    const pollingTimer = setInterval(() => router.refresh(), 60_000);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      clearInterval(pollingTimer);
      void supabase.removeChannel(channel);
    };
  }, [pathname, router]);

  return null;
}
