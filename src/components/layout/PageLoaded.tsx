"use client";

import { useEffect } from "react";

/**
 * Старт анімації першого екрана (див. HeroSection.scss): додає html.is-loaded.
 * Чекаємо самі шрифти — щоб текст не «перескакував» із запасного шрифту.
 * Подвійний rAF: спершу браузер малює початковий стан, потім вмикаємо перехід.
 * Таймаут — запасний варіант, якщо шрифти зависли.
 */
/** Мс від початку переходу між сторінками, коли нова «картка» починає розгортатись */
const VT_EXPAND_AT = 1000;

const PageLoaded = () => {
  useEffect(() => {
    let cancelled = false;
    const fontsOrTimeout = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    // Прийшли переходом між сторінками (див. app/layout.tsx): нова сторінка спершу
    // чекає маленькою карткою — запускаємо появу, коли картка почне розгортатись
    const vtStart = Number(document.documentElement.dataset.vtStart);
    const waitTransition = new Promise((resolve) =>
      setTimeout(resolve, vtStart ? Math.max(0, VT_EXPAND_AT - (Date.now() - vtStart)) : 0),
    );
    Promise.all([fontsOrTimeout, waitTransition]).then(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) document.documentElement.classList.add("is-loaded");
        }),
      ),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default PageLoaded;
