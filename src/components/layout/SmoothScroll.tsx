"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { isScrollLocked } from "./lenis";

// easeInOutQuart — плавний старт і плавна зупинка для переходу до якоря
const anchorEasing = (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2);

/**
 * Плавна прокрутка колесом/тачпадом (Lenis) для всього сайту.
 * - Посилання на якорі (href="#…") теж їдуть плавно — опція anchors,
 *   окремий код для кожного посилання не потрібен.
 * - На телефонах лишається рідна прокрутка (дотики Lenis не чіпає).
 * - Блоки з власною прокруткою позначаємо data-lenis-prevent.
 * - Меню й переглядач фото блокують її через lockScroll() (./lenis).
 * - Хто вимкнув анімації в системі — звичайна прокрутка.
 */
const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      anchors: { duration: 1.2, easing: anchorEasing },
      // Меню чи переглядач фото відкриті — колесо не прокручує сторінку
      virtualScroll: () => !isScrollLocked(),
    });

    return () => lenis.destroy();
  }, []);

  return null;
};

export default SmoothScroll;
