import type { Metadata } from "next";
import DonatePage from "@/features/donate/DonatePage";

const DESCRIPTION =
  "Підтримати служіння церкви «Спасіння» в Підгайцях: загальна пожертва або окремий напрям — діти й молодь, соціальна допомога, дім молитви. Оплата через LiqPay.";

export const metadata: Metadata = {
  title: "Підтримати служіння",
  description: DESCRIPTION,
  alternates: { canonical: "/pidtrymaty" },
  openGraph: {
    type: "website",
    title: "Підтримати служіння церкви «Спасіння»",
    description: DESCRIPTION,
    url: "/pidtrymaty",
  },
};

export default function DonateRoute() {
  return <DonatePage />;
}
