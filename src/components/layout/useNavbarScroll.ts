import { useEffect, useState } from "react";

/**
 * Межа «верху сторінки»: вище неї видно всю шапку разом з логотипом,
 * нижче — кнопки ховаються при скролі вниз, а логотип не показується.
 */
const TOP_ZONE = 150;
/** Мінімальний рух скролу, на який реагуємо (щоб не смикалась) */
const DELTA = 8;

/**
 * Стан шапки при скролі:
 * - isScrolled — сторінка прокручена нижче TOP_ZONE (логотип ховаємо);
 * - isHidden — користувач гортає вниз, шапку ховаємо; при скролі вгору — показуємо.
 */
export const useNavbarScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;

      const isBelowTop = y > TOP_ZONE;
      const wasBelowTop = lastY > TOP_ZONE;

      // На межі верху логотип і кнопки перемикаються в одному кадрі.
      // Поріг DELTA діє лише всередині сторінки, інакше при повільному
      // скролі (тачпад, плавний скрол Windows) кнопки відставали від логотипа.
      if (isBelowTop === wasBelowTop && Math.abs(y - lastY) < DELTA) return;

      setIsScrolled(isBelowTop);
      setIsHidden(isBelowTop && y > lastY);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { isScrolled, isHidden };
};
