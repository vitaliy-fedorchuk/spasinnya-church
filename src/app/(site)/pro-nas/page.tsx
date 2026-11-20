import type { Metadata } from "next";
import AboutHubPage from "@/features/about-hub/AboutHubPage";

const DESCRIPTION =
  "Церква «Спасіння» в Підгайцях: віровчення, цінності, історія, бачення, служіння і керівництво церкви.";

export const metadata: Metadata = {
  title: "Про нас",
  description: DESCRIPTION,
  alternates: { canonical: "/pro-nas" },
  openGraph: { type: "website", title: "Про церкву «Спасіння»", description: DESCRIPTION, url: "/pro-nas" },
};

export default function AboutRoute() {
  return <AboutHubPage />;
}
