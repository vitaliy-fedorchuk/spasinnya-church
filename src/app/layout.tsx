import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/fonts.scss";

// Спільна оболонка для сайту й адмінки. Навбар, футер і стилі сайту —
// у app/(site)/layout.tsx, оформлення адмінки — у app/admin/layout.tsx.

export const metadata: Metadata = {
  // Повна адреса сайту — для карток у соцмережах (og:image тощо)
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Церква Спасіння",
    template: "%s — Церква Спасіння",
  },
  description: "Церква Спасіння — богослужіння, служіння, події та новини громади.",
};

// Windows (ClearType/DirectWrite) малює світлий текст на темному фоні товстішим,
// ніж Figma. CSS-властивості згладжування там не діють, тому стилі можуть
// підлаштувати вагу шрифту через клас html.is-windows. Ставимо його ще до
// першого малювання — інлайн-скриптом у <head>, щоб текст не «блимав».
const WINDOWS_SCRIPT = `if(navigator.userAgent.indexOf("Windows")>-1)document.documentElement.classList.add("is-windows")`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Класи is-windows / is-loaded додаються в браузері — React не має на це сваритись
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: WINDOWS_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
