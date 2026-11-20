"use client";

import { useEffect, useState } from "react";

export interface Chapter {
  id: string;
  year: string;
  title: string;
}

/**
 * Бічна стрічка розділів: роки й назви, поточний розділ підсвічується,
 * пройдені — коричневі. Розділ «поточний», коли він перетинає смугу
 * трохи вище середини екрана.
 */
const HistoryRail = ({ chapters }: { chapters: Chapter[] }) => {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    let frame = 0;
    // Поточний — останній розділ, чий верх уже вище 45% екрана (до першого — перший)
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;
      let id = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top < line) id = el.id;
      if (id) setActive(id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [chapters]);

  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === active),
  );

  return (
    <nav className="history-rail" aria-label="Розділи історії">
      <ol className="history-rail__list" style={{ "--progress": activeIndex / (chapters.length - 1) } as React.CSSProperties}>
        {chapters.map((c, i) => (
          <li
            key={c.id}
            className={`history-rail__item${i < activeIndex ? " is-passed" : ""}${i === activeIndex ? " is-active" : ""}`}
          >
            <a href={`#${c.id}`} aria-current={i === activeIndex ? "step" : undefined}>
              <span className="history-rail__year">{c.year}</span>
              <span className="history-rail__title">{c.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default HistoryRail;
