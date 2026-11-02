import type { Metadata } from "next";

import { LeagueCenterView } from "@/components/league/LeagueCenterView";
import { createPageMetadata } from "@/lib/seo";
import { getServerNow } from "@/lib/server-time";
import { getLeagueCenterData, istanbulToday } from "@/lib/tff/league-center";

export const metadata: Metadata = createPageMetadata({
  title: "TFF Fikstürü | Samandıra İdman Yurdu Akademi",
  description:
    "Samandıra İdman Yurdu akademi takımlarının TFF İstanbul İl Temsilciliği tarafından yayımlanan resmî fikstür, sonuç ve puan durumu bilgileri.",
  path: "/lig-merkezi",
});

export default async function LigMerkeziPage({
  searchParams,
}: {
  searchParams: Promise<{ sezon?: string | string[] }>;
}) {
  const { sezon } = await searchParams;
  const [data, now] = await Promise.all([
    getLeagueCenterData(typeof sezon === "string" ? sezon : undefined),
    getServerNow(),
  ]);

  return <LeagueCenterView data={data} today={istanbulToday(now)} />;
}
