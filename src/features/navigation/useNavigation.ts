import { useCallback, useEffect, useState } from "react";
import { lockScroll, unlockScroll } from "@/components/layout/lenis";

/**
 * Скільки триває закриття шторки меню — має збігатися з transition clip-path
 * у FullscreenMenu.scss (1s). До кінця анімації скрол лишається заблокованим,
 * щоб скролбар не вискакував посеред закриття.
 */
const CLOSE_ANIMATION_MS = 1000;

/**
 * Стан повноекранного меню: відкриття/закриття, закриття по Esc
 * та блокування прокрутки сторінки, поки меню відкрите (і поки воно закривається).
 */
export const useNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Меню вже закрили, але шторка ще їде вгору
  const [isClosing, setIsClosing] = useState(false);
  const isScrollLocked = isOpen || isClosing;

  const close = useCallback(() => {
    setIsOpen(false);
    setIsClosing(true);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, close, open]);

  // Esc закриває меню
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Після анімації закриття розблоковуємо скрол.
  // Якщо меню знову відкрили раніше — таймер скасовується.
  useEffect(() => {
    if (!isClosing) return;

    const timer = setTimeout(() => setIsClosing(false), CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    if (!isScrollLocked) return;

    const { body, documentElement: root } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Ширина скролбару, який зникне. Замість нього додаємо такий самий відступ,
    // щоб сторінка не стрибала по ширині. Фіксовані елементи (навбар)
    // беруть ту саму ширину з --scrollbar-width.
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    body.style.paddingRight = `${scrollbarWidth}px`;
    body.style.overflow = "hidden";
    // Плавна прокрутка (Lenis) крутить сторінку сама — блокуємо і її
    lockScroll();

    return () => {
      unlockScroll();
      root.style.removeProperty("--scrollbar-width");
      body.style.paddingRight = prevPaddingRight;
      body.style.overflow = prevOverflow;
    };
  }, [isScrollLocked]);

  return { isOpen, isClosing, toggle, close };
};
