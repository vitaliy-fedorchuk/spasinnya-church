/**
 * Блокування плавної прокрутки (Lenis, див. SmoothScroll) з будь-якого місця:
 * меню, переглядач фото. Звичайний модуль, а не "use client".
 *
 * Не lenis.stop(): він ставить overflow: clip і ховає смугу прокрутки —
 * сторінка стрибала б на її ширину. Натомість Lenis просто ігнорує колесо,
 * поки хоч щось тримає блокування (лічильник — якщо їх кілька одночасно).
 */
let locks = 0;

export const lockScroll = () => {
  locks++;
};

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1);
};

export const isScrollLocked = () => locks > 0;
