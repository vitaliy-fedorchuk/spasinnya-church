import type { Metadata } from "next";
import MinistriesPage from "@/features/ministries/MinistriesPage";

const DESCRIPTION =
  "Служіння та проєкти церкви «Спасіння» в Підгайцях: дитяча школа, підлітковий клуб, молодь, жіноче служіння, коледж «Тимофій», творча й дошкільна студії.";

export const metadata: Metadata = {
  title: "Служіння та проєкти",
  description: DESCRIPTION,
  alternates: { canonical: "/sluzhinnya" },
  openGraph: { type: "website", title: "Служіння та проєкти церкви «Спасіння»", description: DESCRIPTION, url: "/sluzhinnya" },
};

export default function MinistriesRoute() {
  return <MinistriesPage />;
}
