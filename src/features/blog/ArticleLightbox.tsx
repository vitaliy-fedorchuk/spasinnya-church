"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./ArticleLightbox.scss";

/**
 * Перегляд фото статті на весь екран.
 *
 * Фото «виростає» з місця, де стоїть, і розкривається з обрізаної мініатюри
 * до повного кадру (FLIP + анімація обрізки, Web Animations API — без бібліотек).
 * Спершу показуємо вже завантажену мініатюру, поверх підвантажуємо версію 2400px.
 * Гортання: стрілки, ← →, свайп; закриття: фон, Esc, ×, свайп униз.
 *
 * Які фото відкриваються — позначено в блоках атрибутом data-zoom (MediaBlocks.tsx).
 */

const SELECTOR = ".article [data-zoom]";
const OPEN_MS = 480;
const CLOSE_MS = 380;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

interface Slide {
  el: HTMLImageElement;
  thumb: string;
  full: string;
  caption: string;
  /** Пропорції оригіналу (ширина / висота) */
  ratio: number;
}

/** Клавіші, якими прокручують сторінку — поки фото відкрите, вимкнені */
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const slideOf = (el: HTMLImageElement): Slide => ({
  el,
  thumb: el.currentSrc || el.src,
  full: el.dataset.zoom || el.currentSrc || el.src,
  caption: el.dataset.zoomCaption ?? "",
  ratio: el.naturalWidth && el.naturalHeight ? el.naturalWidth / el.naturalHeight : 4 / 3,
});

/** Розмір фото у переглядачі: вписати в екран з відступами (і місцем під підпис) */
const fitSize = (ratio: number) => {
  const mobile = window.innerWidth < 768;
  const maxW = window.innerWidth - (mobile ? 24 : 160);
  const maxH = window.innerHeight - (mobile ? 140 : 180);
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { w: Math.round(w), h: Math.round(h) };
};

/**
 * Кадри анімації «з мініатюри»: мініатюра показує фото з object-fit: cover,
 * тобто обрізаним. Рахуємо, де опинилось би ПОВНЕ фото, і обрізаємо його
 * clip-path до видимої частини мініатюри — далі анімуємо до повного кадру.
 */
const flipFrom = (thumb: HTMLImageElement, target: DOMRect, radius: number) => {
  const s = thumb.getBoundingClientRect();
  const ratio = thumb.naturalWidth / thumb.naturalHeight || target.width / target.height;
  // Розмір повного фото, яким воно «накрило» б мініатюру
  const coverW = Math.max(s.width, s.height * ratio);
  const coverH = coverW / ratio;
  const cx = s.left + (s.width - coverW) / 2;
  const cy = s.top + (s.height - coverH) / 2;

  const scale = coverW / target.width;
  const dx = cx + coverW / 2 - (target.left + target.width / 2);
  const dy = cy + coverH / 2 - (target.top + target.height / 2);
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
  const thumbRadius = parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;

  return {
    from: {
      transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      clipPath: `inset(${pct(s.top - cy, coverH)} ${pct(cx + coverW - s.right, coverW)} ${pct(
        cy + coverH - s.bottom,
        coverH,
      )} ${pct(s.left - cx, coverW)} round ${thumbRadius / scale}px)`,
    },
    to: { transform: "translate(0, 0) scale(1)", clipPath: `inset(0% 0% 0% 0% round ${radius}px)` },
  };
};

/** Чи видно елемент на екрані (тоді закриваємо «назад у мініатюру») */
const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
};

const ArticleLightbox = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [fullLoaded, setFullLoaded] = useState<Record<string, boolean>>({});
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const animating = useRef(false);
  const pendingOpen = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const isOpen = index !== null;
  const slide = index !== null ? slides[index] : null;

  // ---------- Відкрити ----------
  const openAt = useCallback((el: HTMLImageElement) => {
    if (animating.current || !el.complete || !el.naturalWidth) return;
    const all = [...document.querySelectorAll<HTMLImageElement>(SELECTOR)].filter((x) => x.complete && x.naturalWidth);
    const i = all.indexOf(el);
    if (i < 0) return;
    setSlides(all.map(slideOf));
    pendingOpen.current = true;
    setIndex(i);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest?.(SELECTOR);
      if (el instanceof HTMLImageElement) {
        e.preventDefault();
        openAt(el);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as Element;
      if ((e.key === "Enter" || e.key === " ") && el instanceof HTMLImageElement && el.matches(SELECTOR)) {
        e.preventDefault();
        openAt(el);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openAt]);

  // Анімація відкриття — після того, як переглядач намалювався
  useLayoutEffect(() => {
    if (!pendingOpen.current || !slide || !imgRef.current || !boxRef.current) return;
    pendingOpen.current = false;
    const img = imgRef.current;
    closeRef.current?.focus({ preventScroll: true });

    if (reducedMotion()) {
      boxRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }
    animating.current = true;
    const { from, to } = flipFrom(slide.el, img.getBoundingClientRect(), 12);
    img.animate([from, to], { duration: OPEN_MS, easing: EASE_OUT });
    boxRef.current.animate([{ backgroundColor: "rgba(17,17,20,0)" }, { backgroundColor: "rgba(17,17,20,0.97)" }], {
      duration: OPEN_MS * 0.6,
      easing: "linear",
    });
    const ui = boxRef.current.querySelectorAll(".lb__ui");
    ui.forEach((u) => u.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: OPEN_MS * 0.5, fill: "backwards" }));
    setTimeout(() => (animating.current = false), OPEN_MS);
  }, [slide]);

  // ---------- Закрити ----------
  const close = useCallback(() => {
    if (index === null || animating.current) return;
    const img = imgRef.current;
    const box = boxRef.current;
    const source = slides[index]?.el;
    const finish = () => {
      setIndex(null);
      animating.current = false;
      // Фокус — назад на фото, з якого відкривали
      source?.focus({ preventScroll: true });
    };
    if (!img || !box || reducedMotion()) return finish();

    animating.current = true;
    box.querySelectorAll(".lb__ui").forEach((u) => u.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }));
    box.animate([{ backgroundColor: "rgba(17,17,20,0.97)" }, { backgroundColor: "rgba(17,17,20,0)" }], {
      duration: CLOSE_MS,
      delay: CLOSE_MS * 0.3,
      fill: "forwards",
      easing: "ease-in",
    });
    if (source && inView(source)) {
      const { from, to } = flipFrom(source, img.getBoundingClientRect(), 12);
      img.animate([to, from], { duration: CLOSE_MS, easing: EASE_IN_OUT, fill: "forwards" }).finished.then(finish);
    } else {
      img
        .animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.94)" }], {
          duration: 250,
          fill: "forwards",
        })
        .finished.then(finish);
    }
  }, [index, slides]);

  // ---------- Гортання ----------
  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null || slides.length < 2 || animating.current) return;
      const next = (index + dir + slides.length) % slides.length;
      setIndex(next);
      requestAnimationFrame(() => {
        if (reducedMotion()) return;
        imgRef.current?.animate(
          [
            { opacity: 0, transform: `translateX(${dir * 40}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 260, easing: EASE_OUT },
        );
      });
    },
    [index, slides.length],
  );

  // Клавіатура, заборона прокрутки сторінки під переглядачем
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (SCROLL_KEYS.has(e.key) && !(e.target instanceof HTMLButtonElement && e.key === " ")) e.preventDefault();
      else if (e.key === "Tab") {
        // Фокус не виходить за межі переглядача
        const focusables = boxRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    // Сторінку не прокручуємо, але й смугу прокрутки НЕ ховаємо (overflow: hidden
    // прибирав би її — і вся сторінка стрибала б на її ширину). Просто гасимо
    // прокрутку коліщатком і пальцем; щипок двома пальцями (зум) лишаємо.
    const stopWheel = (e: WheelEvent) => e.preventDefault();
    const stopTouch = (e: TouchEvent) => e.touches.length < 2 && e.preventDefault();
    window.addEventListener("wheel", stopWheel, { passive: false });
    window.addEventListener("touchmove", stopTouch, { passive: false });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", stopWheel);
      window.removeEventListener("touchmove", stopTouch);
    };
  }, [isOpen, close, go]);

  // Велика версія: підвантажуємо поточне фото й сусідні
  useEffect(() => {
    if (index === null) return;
    for (const i of [index, index + 1, index - 1]) {
      const s = slides[(i + slides.length) % slides.length];
      if (!s || fullLoaded[s.full]) continue;
      const pre = new Image();
      pre.onload = () => setFullLoaded((m) => ({ ...m, [s.full]: true }));
      pre.src = s.full;
    }
  }, [index, slides, fullLoaded]);

  if (!slide) return null;

  const { w, h } = fitSize(slide.ratio);
  const many = slides.length > 1;

  return (
    <div
      ref={boxRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Перегляд фото"
      onClick={(e) => e.target === e.currentTarget && close()}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start || e.touches.length) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close();
      }}
    >
      <div className="lb__stage" onClick={(e) => e.target === e.currentTarget && close()}>
        <img
          ref={imgRef}
          className="lb__img"
          src={fullLoaded[slide.full] ? slide.full : slide.thumb}
          alt={slide.el.alt}
          width={w}
          height={h}
          style={{ width: w, height: h }}
          draggable={false}
          onClick={close}
        />
      </div>

      <div className="lb__bar lb__ui">
        {many && (
          <span className="lb__count">
            {index! + 1} / {slides.length}
          </span>
        )}
        {slide.caption && <p className="lb__caption">{slide.caption}</p>}
      </div>

      <button ref={closeRef} type="button" className="lb__btn lb__close lb__ui" onClick={close} aria-label="Закрити">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {many && (
        <>
          <button type="button" className="lb__btn lb__prev lb__ui" onClick={() => go(-1)} aria-label="Попереднє фото">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="lb__btn lb__next lb__ui" onClick={() => go(1)} aria-label="Наступне фото">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default ArticleLightbox;
