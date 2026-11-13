import { useEffect, useRef, useState, type RefObject } from "react";
import "./ArticlePage.scss";
import type { Article } from "./types";
import ArticleBlocks from "./blocks/ArticleBlocks";
import bookIcon from "../../assets/news/book.svg";

/** Тонка смужка зверху: скільки статті вже прочитано */
const useReadingProgress = (ref: RefObject<HTMLElement | null>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      setProgress(total > 0 ? Math.min(Math.max(-box.top / total, 0), 1) : 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
};

const ShareButtons = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

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

const ArticlePage = ({ article }: { article: Article }) => {
  const ref = useRef<HTMLElement>(null);
  const progress = useReadingProgress(ref);

  useEffect(() => {
    const prev = document.title;
    document.title = `${article.title} — Церква Спасіння`;
    return () => {
      document.title = prev;
    };
  }, [article.title]);

  return (
    <article ref={ref} className="article" aria-labelledby="article-title">
      <div className="article__progress" style={{ transform: `scaleX(${progress})` }} />

      <header className="article-hero" data-surface="dark">
        <img className="article-hero__bg" src={article.cover.src} alt={article.cover.alt} />

        <div className="container article-hero__inner">
          <a className="article-hero__back" href="#news">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12.5 4.5 7 10l5.5 5.5" />
            </svg>
            Усі новини
          </a>

          <ul className="article-hero__tags" aria-label="Теги">
            {article.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <h1 id="article-title" className="article-hero__title">
            {article.title}
          </h1>

          <div className="article-hero__meta">
            <div className="article-hero__author">
              <img src={article.author.photo} alt="" />
              <div>
                <p className="article-hero__author-name">{article.author.name}</p>
                <p className="article-hero__author-role">{article.author.role}</p>
              </div>
            </div>
            <div className="article-hero__info">
              <time dateTime={article.date}>{article.dateLabel}</time>
              <span className="article-hero__read-time">
                <img src={bookIcon} alt="" />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container article__body">
        <ArticleBlocks blocks={article.blocks} />

        <footer className="article__footer">
          <ul className="article__tags" aria-label="Теги">
            {article.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <ShareButtons title={article.title} />
        </footer>
      </div>
    </article>
  );
};

export default ArticlePage;
