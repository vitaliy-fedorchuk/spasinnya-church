import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import CommunitySection from "@/components/sections/CommunitySection";
import EventsSection from "@/components/sections/EventsSection";
import WelcomeSection from "@/components/sections/WelcomeSection";
import MinistriesSection from "@/components/sections/MinistriesSection";
import FaqSection from "@/components/sections/FaqSection";
import NewsSection from "@/components/sections/NewsSection";
import { getLatestArticles } from "@/server/articles";

// Сторінка збирається на кожен запит: щойно опублікована стаття видно одразу,
// а збірка сайту не потребує доступу до бази. Запит до бази — мілісекунди;
// якщо колись знадобиться, додамо кешування.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const news = await getLatestArticles({ limit: 3 });

  return (
    <>
      <HeroSection />
      <AboutSection />
      <CommunitySection />
      <EventsSection />
      <WelcomeSection />
      <MinistriesSection />
      <FaqSection />
      <NewsSection articles={news} />
    </>
  );
}
