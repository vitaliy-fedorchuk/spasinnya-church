import type { ReactNode } from "react";
import "@/styles/global.scss";
import "@/styles/page-transition.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageLoaded from "@/components/layout/PageLoaded";
import ScrollReveal from "@/components/layout/ScrollReveal";
import SmoothScroll from "@/components/layout/SmoothScroll";

/**
 * Speculation Rules: наведення на посилання (~200 мс) — браузер заздалегідь
 * готує сторінку у фоні, і після кліку перехід стартує одразу, без паузи на
 * завантаження. Chrome/Edge; інші браузери просто ігнорують. Адмінку, API,
 * файли й превʼю не чіпаємо.
 */
const SPECULATION_RULES = JSON.stringify({
  prerender: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: ["/admin*", "/api/*", "/uploads/*", "/preview/*"] } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

/** Публічний сайт: навбар, футер, резинова верстка */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoaded />
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }} />
      <SmoothScroll />
      <ScrollReveal />
      {/* Бежева картка для переходу між сторінками (global.scss) */}
      <div className="vt-middle" aria-hidden="true" />
      <div className="App">
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  );
}
