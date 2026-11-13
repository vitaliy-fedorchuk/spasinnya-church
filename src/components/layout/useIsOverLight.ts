import { useEffect, useState, type RefObject } from "react";

/** Атрибут, яким позначаємо темні ділянки сторінки (фото, темні блоки) */
export const DARK_SURFACE_ATTR = "data-surface";
const DARK_SELECTOR = `[${DARK_SURFACE_ATTR}="dark"]`;

/**
 * Чи лежить центр елемента над світлим фоном сторінки.
 * Темні ділянки позначені data-surface="dark"; все інше вважаємо світлим (#f5f5f5).
 * Перевіряємо при скролі та зміні розміру вікна (не частіше за кадр).
 */
export const useIsOverLight = (ref: RefObject<HTMLElement | null>) => {
  const [isOverLight, setIsOverLight] = useState(false);

  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const box = el.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;

      const isOverDark = Array.from(document.querySelectorAll(DARK_SELECTOR)).some((surface) => {
        const r = surface.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });

      setIsOverLight(!isOverDark);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return isOverLight;
};
