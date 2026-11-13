import "./ArticlePage.scss";
import type { Article } from "./types";
import ArticleBlocks from "./blocks/ArticleBlocks";
import { srcSetOf, variantOf } from "@/features/media/urls";
import { ReadingProgress, ShareButtons } from "./ArticleClient";
import bookIconAsset from "../../assets/news/book.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const bookIcon = bookIconAsset.src;

const ArticlePage = ({ article }: { article: Article }) => {
  return (
    <article className="article" aria-labelledby="article-title">
      <ReadingProgress />

      <header className="article-hero" data-surface="dark">
        <img
          className="article-hero__bg"
          src={article.cover.src}
          srcSet={srcSetOf(article.cover.src)}
          sizes="100vw"
          alt={article.cover.alt}
        />

        <div className="container article-hero__inner">
          <a className="article-hero__back" href="/#news">
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
              <img src={variantOf(article.author.photo, 480)} alt="" />
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
