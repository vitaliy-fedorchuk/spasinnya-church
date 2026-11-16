import "./NewsCard.scss";
import bookIconAsset from "../../assets/news/book.svg";
import { articleHref, type Article } from "../../features/blog";
import { srcSetOf, variantOf } from "@/features/media/urls";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const bookIcon = bookIconAsset.src;

interface NewsCardProps {
  article: Article;
  /** Атрибут sizes для обкладинки — залежить від сітки, в якій стоїть картка */
  sizes: string;
  /** Число й день тижня на фото («Часопис»: дата важливіша за все інше) */
  dateBadge?: { day: string; weekday: string };
  /** Тег-обгортка: li у списку, article окремо */
  as?: "li" | "article";
  className?: string;
}

/** Картка статті — однакова на головній і в «Часописі новин» */
const NewsCard = ({ article, sizes, dateBadge, as: Tag = "li", className = "" }: NewsCardProps) => (
  <Tag className={`news-card ${className}`.trim()}>
    <div className="news-card__media">
      <img
        className="news-card__image"
        src={article.cover.src}
        srcSet={srcSetOf(article.cover.src)}
        sizes={sizes}
        alt=""
        loading="lazy"
      />
      {dateBadge && (
        <span className="news-card__badge" aria-hidden="true">
          <b>{dateBadge.day}</b>
          {dateBadge.weekday}
        </span>
      )}
    </div>

    <div className="news-card__body">
      <p className="news-card__read-time">
        <img src={bookIcon} width={16} height={16} alt="" />
        {article.readTime}
      </p>

      {article.tags.length > 0 && (
        <ul className="news-card__tags" aria-label="Теги">
          {article.tags.map((tag) => (
            <li key={tag} className="news-card__tag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <h3 className="news-card__title">
        {/* Посилання розтягнуте на всю картку (::after) */}
        <a className="news-card__link" href={articleHref(article.slug)}>
          {article.title}
        </a>
      </h3>

      <footer className="news-card__meta">
        <div className="news-card__author">
          {article.author.photo && (
            <img className="news-card__avatar" src={variantOf(article.author.photo, 480)} alt="" loading="lazy" />
          )}
          <div>
            <p className="news-card__author-name">{article.author.name}</p>
            <p className="news-card__author-role">{article.author.role}</p>
          </div>
        </div>
        <time className="news-card__date" dateTime={article.date}>
          {article.dateLabel}
        </time>
      </footer>
    </div>
  </Tag>
);

export default NewsCard;
