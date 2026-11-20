import type { Metadata } from "next";
import OfferPage from "@/features/offer/OfferPage";

const DESCRIPTION = "Публічна оферта церкви «Спасіння» про надання добровільної благодійної пожертви.";

export const metadata: Metadata = {
  title: "Публічна оферта",
  description: DESCRIPTION,
  alternates: { canonical: "/oferta" },
  openGraph: {
    type: "website",
    title: "Публічна оферта — церква «Спасіння»",
    description: DESCRIPTION,
    url: "/oferta",
  },
};

export default function OfferRoute() {
  return <OfferPage />;
}
