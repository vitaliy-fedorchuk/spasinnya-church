import type { ReactNode } from "react";
import "@/styles/global.scss";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageLoaded from "@/components/layout/PageLoaded";
import ScrollReveal from "@/components/layout/ScrollReveal";

/** Публічний сайт: навбар, футер, резинова верстка */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoaded />
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
