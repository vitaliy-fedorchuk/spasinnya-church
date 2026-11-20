"use client";

import { useEffect } from "react";

/**
 * Легкий «слайд ап» при прокрутці: блоки нижче першого екрана зʼявляються,
 * трохи виїжджаючи знизу, коли до них догортають.
 *
 * - Ховаємо лише те, що на старті нижче видимої частини екрана, — нічого не
 *   блимає і не зникає з уже видимого.
 * - Картки, рядки й кроки анімуються поштучно (з невеликою чергою), інші
 *   блоки секцій — цілими обгортками. Вкладені цілі не анімуються двічі.
 * - Нові блоки (фільтри «Часопису», «Старіші новини») підхоплює MutationObserver.
 * - prefers-reduced-motion — нічого не робимо.
 */

// Поштучні елементи: картки, рядки, кроки, блоки статті
const ITEMS = [
  ".news-card",
  ".archive-row",
  ".archive-month__head",
  ".archive-empty",
  ".visit-step",
  ".visit-card",
  ".visit-schedule",
  ".visit-cta__box",
  ".article__body > *",
  ".article__about",
  ".history-fact",
  ".history-text",
  ".history-chapter__head",
  ".history-lead",
  ".ab-word",
  ".history-person",
  ".history-step",
  ".history-doc",
  ".photo-stack__item",
  ".history-numbers > div",
  ".history-ministry",
  ".history-stat",
  ".history-team",
  ".history-gen",
  ".history-cta__box",
  ".hub-b__row",
  ".min-ages__card",
  ".contacts-mail",
  ".contacts-visit",
  ".contacts-social",
  ".donate-main",
  ".donate-card",
  ".donate-privat",
  ".donate-qr",
  ".donate-verse",
  ".hub-d__tile",
].join(",");

// Цілі обгортки: прямі нащадки контейнера в секціях (заголовки, тексти, списки)
const GROUPS = "section > .container > *, section > .container > header > *";

// Перший екран і футер мають свої анімації
const SKIP = ".page-hero, .hero, .navbar, .footer, .fullscreen-menu, [data-intro], [data-intro-item]";

const STAGGER = 0.07;

const ScrollReveal = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();

    const reveal = (el: HTMLElement) => {
      el.classList.add("is-revealed");
      // Після появи прибираємо наші класи — повертаються власні transition блоку (ховер тощо)
      const done = () => {
        el.classList.remove("reveal", "is-revealed");
        el.style.removeProperty("--reveal-delay");
      };
      const onEnd = (e: TransitionEvent) => {
        // Чекаємо саме зсув блоку (він найдовший), а не переходи всередині нього
        if (e.target !== el || e.propertyName !== "transform") return;
        el.removeEventListener("transitionend", onEnd);
        done();
      };
      el.addEventListener("transitionend", onEnd);
      setTimeout(done, 1600);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        visible.forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * STAGGER}s`);
          io.unobserve(el);
          reveal(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      const items = [...document.querySelectorAll<HTMLElement>(ITEMS)].filter(
        (el) => !el.parentElement?.closest(ITEMS),
      );
      const groups = [...document.querySelectorAll<HTMLElement>(GROUPS)].filter(
        (el) => !el.closest(ITEMS) && !el.querySelector(ITEMS) && el.tagName !== "HEADER",
      );
      const fold = window.innerHeight;
      for (const el of [...items, ...groups]) {
        if (seen.has(el) || el.closest(SKIP)) continue;
        seen.add(el);
        // Уже видно на екрані — не чіпаємо
        if (el.getBoundingClientRect().top < fold) continue;
        el.classList.add("reveal");
        io.observe(el);
      }
    };

    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
};

export default ScrollReveal;
