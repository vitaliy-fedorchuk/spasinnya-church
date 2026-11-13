import type { ReactNode } from "react";
import "@/styles/global.scss";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageLoaded from "@/components/layout/PageLoaded";

/** Публічний сайт: навбар, футер, резинова верстка */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoaded />
      <div className="App">
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  );
}
