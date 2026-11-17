// Генерує src/styles/page-transition.css — ключові кадри переходу між сторінками.
//
// Відтворює таймлайн Osmo (GSAP) один в один: кілька рухів із різними кривими
// накладаються й «перехоплюють» один одного (overwrite), чого не описати трьома
// ключовими кадрами CSS. Тож рахуємо кожен шар тут, через кожні STEP мс, тими
// самими кривими (expo.inOut і CustomEase «osmo»), а в CSS — лінійно між кроками.
//
// Запуск: node scripts/gen-page-transition.mjs

import { writeFileSync } from "node:fs";

const TOTAL = 2.4; // с — як у прикладі
const STEP = 0.025; // с між ключовими кадрами

// ---------- Криві ----------
const expoInOut = (p) =>
  p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 ** (20 * p - 10) / 2 : 1 - 2 ** (-20 * p + 10) / 2;

// cubic-bezier(x1, y1, x2, y2): шукаємо t за x (Ньютон + бісекція), повертаємо y
const bezier = (x1, y1, x2, y2) => {
  const cx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t ** 2 * (1 - t) + t ** 3;
  const cy = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t ** 2 * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 40; i++) {
      const v = cx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return cy(t);
  };
};
const osmo = bezier(0.625, 0.05, 0, 1); // CustomEase.create("osmo", "0.625, 0.05, 0, 1")

// Один рух: від from до to з start до start+dur
const tween = (t, start, dur, from, to, ease) => {
  const p = Math.min(1, Math.max(0, (t - start) / dur));
  return from + (to - from) * ease(p);
};

// Значення, яке мав попередній рух у мить «перехоплення» (overwrite: "auto")
const at = (start, dur, from, to, ease, when) => tween(when, start, dur, from, to, ease);

// ---------- Шари (час і значення — з прикладу Osmo) ----------
// Скруглення кутів: до повного (--vt-radius) за 0.8 с (osmo), назад у 0 з 1.6 с (osmo)
const radius = (t) => (t < 1.6 ? tween(t, 0, 0.8, 0, 1, osmo) : tween(t, 1.6, 0.8, 1, 0, osmo));

const layers = {
  // Стара сторінка: scale .95 + yPercent 20 (1.2 с expo.inOut), з 0.9 с — падає до 130 (osmo)
  leave: (t) => {
    const scale = tween(t, 0, 1.2, 1, 0.95, expoInOut);
    const y0 = at(0, 1.2, 0, 20, expoInOut, 0.9);
    const y = t < 0.9 ? tween(t, 0, 1.2, 0, 20, expoInOut) : tween(t, 0.9, 1.2, y0, 130, osmo);
    return { scale, y, r: radius(t) };
  },
  // Бежева: scale .875 + yPercent 10, з 1.05 с — падає до 120
  middle: (t) => {
    const scale = tween(t, 0, 1.2, 1, 0.875, expoInOut);
    const y0 = at(0, 1.2, 0, 10, expoInOut, 1.05);
    const y = t < 1.05 ? tween(t, 0, 1.2, 0, 10, expoInOut) : tween(t, 1.05, 1.2, y0, 120, osmo);
    return { scale, y, r: radius(t) };
  },
  // Нова: зменшується до .8 позаду, з 1.2 с розгортається до 1 (expo.inOut)
  enter: (t) => {
    const scale = t < 1.2 ? tween(t, 0, 1.2, 1, 0.8, expoInOut) : tween(t, 1.2, 1.2, 0.8, 1, expoInOut);
    return { scale, y: 0, r: radius(t) };
  },
};

// Знімок сторінки включає місце під смугою прокрутки (--vt-sbw): щойно картка
// зменшилась, обрізаємо цю смугу й зсуваємо картку на її половину — відступи
// зліва і справа однакові. k плавно вмикає це на перших 5% зменшення.
// Бежева (.vt-middle, position: fixed) і так без смуги — її лише зсуваємо.
const fmt = (n, d = 4) => +n.toFixed(d);
const frame = ({ scale, y, r }, cut) => {
  const k = Math.min(1, (1 - scale) / 0.05);
  const shift = fmt((scale * k) / 2);
  const transform = `translate(calc(var(--vt-sbw, 0px) * ${shift}), ${fmt(y, 3)}%) scale(${fmt(scale)})`;
  const right = cut ? `calc(var(--vt-sbw, 0px) * ${fmt(k)})` : "0";
  // Радіус — як у першого блоку сайту (--vt-radius), поділений на масштаб:
  // картка зменшена, і без цього її кути на екрані виглядали б меншими
  const clip = `inset(0 ${right} 0 0 round calc(var(--vt-radius) * ${fmt(r / scale)}))`;
  return `transform: ${transform}; clip-path: ${clip};`;
};

const keyframes = (name, fn, cut) => {
  const steps = Math.round(TOTAL / STEP);
  const lines = [`@keyframes ${name} {`];
  for (let i = 0; i <= steps; i++) {
    const t = i * STEP;
    lines.push(`  ${fmt((t / TOTAL) * 100, 3)}% { ${frame(fn(t), cut)} }`);
  }
  lines.push("}");
  return lines.join("\n");
};

const css = `/* Згенеровано scripts/gen-page-transition.mjs — не редагувати вручну.
   Перехід між сторінками (таймлайн Osmo, ${TOTAL} с). Шари й порядок — у global.scss. */

:root {
  --vt-duration: ${TOTAL}s;
  /* Скруглення карток — як у першого блоку (em(30); на телефоні em(20)) */
  --vt-radius: calc(var(--size-font) * 1.875);
}

@media (max-width: 767px) {
  :root {
    --vt-radius: calc(var(--size-font) * 1.25);
  }
}

${keyframes("vt-leave", layers.leave, true)}

${keyframes("vt-middle", layers.middle, false)}

${keyframes("vt-enter", layers.enter, true)}
`;

writeFileSync(new URL("../src/styles/page-transition.css", import.meta.url), css);
console.log("page-transition.css:", css.length, "bytes");
