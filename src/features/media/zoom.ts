import { variantOf } from "./urls";

/**
 * Фото, яке можна відкрити на весь екран (ArticleLightbox).
 * data-zoom — адреса найбільшої версії, data-zoom-caption — підпис у переглядачі.
 * Окремий модуль (не "use client"), щоб викликати і з серверних компонентів.
 */
export const zoomProps = (src: string, caption: string) => ({
  "data-zoom": variantOf(src, 2400),
  "data-zoom-caption": caption,
  tabIndex: 0,
  role: "button",
  "aria-haspopup": "dialog" as const,
});
