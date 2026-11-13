import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.scss";

export const metadata: Metadata = {
  title: {
    default: "Адмінка",
    template: "%s — Адмінка",
  },
  // Адмінку пошуковики не індексують
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
