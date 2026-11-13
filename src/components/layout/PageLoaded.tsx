"use client";

import { useEffect } from "react";

/**
 * Старт анімації першого екрана (див. HeroSection.scss): додає html.is-loaded.
 * Чекаємо самі шрифти — щоб текст не «перескакував» із запасного шрифту.
 * Подвійний rAF: спершу браузер малює початковий стан, потім вмикаємо перехід.
 * Таймаут — запасний варіант, якщо шрифти зависли.
 */
const PageLoaded = () => {
  useEffect(() => {
    let cancelled = false;
    const fontsOrTimeout = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    fontsOrTimeout.then(() =>
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
