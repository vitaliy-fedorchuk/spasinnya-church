"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Тонка смужка зверху: скільки статті вже прочитано.
 * Ставиться всередину <article> — міряє свого батька.
 */
export const ReadingProgress = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = ref.current?.parentElement;
      if (!article) return;
      const box = article.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      setProgress(total > 0 ? Math.min(Math.max(-box.top / total, 0), 1) : 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="article__progress" style={{ transform: `scaleX(${progress})` }} />;
};

const noop = () => () => {};

export const ShareButtons = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);
  // На сервері navigator немає — кнопка «Надіслати» зʼявляється лише в браузері
  const canShare = useSyncExternalStore(
    noop,
    () => "share" in navigator,
    () => false,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер обміну недоступний — нічого не робимо */
    }
  };

  const share = () => navigator.share({ title, url: window.location.href }).catch(() => {});

  return (
    <div className="article__share">
      <span className="article__share-label">Поділитися:</span>
      <button type="button" className="article__share-btn" onClick={copy}>
        {copied ? "Скопійовано ✓" : "Копіювати посилання"}
      </button>
      {canShare && (
        <button type="button" className="article__share-btn" onClick={share}>
          Надіслати
        </button>
      )}
    </div>
  );
};
