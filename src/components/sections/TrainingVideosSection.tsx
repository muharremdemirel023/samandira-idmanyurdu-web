import { TrainingVideosSectionWrapper } from "@/components/sections/TrainingVideosSection.client";
import { getActiveVideos } from "@/lib/content";

/** Admin panelde eklenen antrenman videolarını (9:16 dikey) gösterir; video yoksa bölüm hiç render edilmez. */
export async function TrainingVideosSection() {
  const videos = await getActiveVideos();

  return (
    <TrainingVideosSectionWrapper
      videos={videos}
      title="Antrenman Videoları"
      subtitle="Sahadaki enerjimizi ve gelişim odaklı antrenman anlarımızı videolarla keşfedin."
    />
  );
}
