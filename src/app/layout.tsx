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

// Перехід між сторінками (global.scss → «Перехід між сторінками»): браузер знімає
// «до» і «після» як картинки. Щоб стара й нова сторінки стали окремими картками
// (а між ними — бежева), даємо їм різні імена: старій — у pageswap перед знімком,
// новій — у pagereveal. Слухачі мають стояти ще до першого малювання, тож тут, у <head>.
const PAGE_TRANSITION_SCRIPT = `(function(){var h=document.documentElement;
addEventListener("pageswap",function(e){if(e.viewTransition)h.classList.add("vt-leaving")});
addEventListener("pageshow",function(){h.classList.remove("vt-leaving")});
addEventListener("pagereveal",function(e){if(!e.viewTransition)return;h.classList.add("vt-entering","vt-arrived");h.dataset.vtStart=String(Date.now());
e.viewTransition.finished.finally(function(){h.classList.remove("vt-entering")})})})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Класи is-windows / is-loaded додаються в браузері — React не має на це сваритись
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: WINDOWS_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: PAGE_TRANSITION_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
