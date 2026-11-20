import type { Metadata } from "next";
import HistoryPage from "@/features/history/HistoryPage";
import { getChurchStats } from "@/server/church-stats";

// Числа церкви — з адмінки, тож на кожен запит
export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Як у 2016 році з молитви народилася церква «Спасіння» в Підгайцях: сім братів, чотири роки будівництва, посвячення Дому молитви і громада, що росте й сьогодні.";

export const metadata: Metadata = {
  title: "Історія церкви",
  description: DESCRIPTION,
  alternates: { canonical: "/istoriya" },
  openGraph: { type: "article", title: "Історія церкви «Спасіння»", description: DESCRIPTION, url: "/istoriya" },
};

export default async function HistoryRoute() {
  return <HistoryPage stats={await getChurchStats()} />;
}
