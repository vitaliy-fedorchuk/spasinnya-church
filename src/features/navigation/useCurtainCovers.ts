import { useEffect, useState, type RefObject } from "react";
import { FULLSCREEN_MENU_ID } from "./FullscreenMenu";

/**
 * Чи закриває шторка меню (під час анімації закриття) центр елемента.
 * Шторка їде знизу вгору: щокадру читаємо її поточний clip-path
 * і порівнюємо нижній край із позицією елемента.
 */
export const useCurtainCovers = (ref: RefObject<HTMLElement | null>, isClosing: boolean) => {
  const [covers, setCovers] = useState(true);

  useEffect(() => {
    if (!isClosing) return;

    const menu = document.getElementById(FULLSCREEN_MENU_ID);
    let frame = 0;

    const check = () => {
      const el = ref.current;
      if (menu && el) {
        // polygon(0% 0%, 100% 0%, 100% X%, 0% X%) → X — нижній край шторки
        const values = getComputedStyle(menu).clipPath.match(/[\d.]+%/g) ?? [];
        const bottomPercent = parseFloat(values[5] ?? "0");
        const curtainBottom = (bottomPercent / 100) * window.innerHeight;
        const box = el.getBoundingClientRect();
        const covered = curtainBottom > box.top + box.height / 2;

        setCovers(covered);
        if (!covered) return; // шторка вже пройшла — далі не стежимо
      }
      frame = requestAnimationFrame(check);
    };

    frame = requestAnimationFrame(check);
    return () => {
      cancelAnimationFrame(frame);
      setCovers(true);
    };
  }, [ref, isClosing]);

  return isClosing && covers;
};
