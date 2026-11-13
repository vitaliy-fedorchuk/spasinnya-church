import "./NewsSection.scss";
import Rubricator from "../ui/Rubricator";
import BlackButton from "../buttons/BlackButton";
import newspaperIconAsset from "../../assets/news/newspaper.svg";
import bookIconAsset from "../../assets/news/book.svg";
import { articleHref, type Article } from "../../features/blog";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const newspaperIcon = newspaperIconAsset.src;
const bookIcon = bookIconAsset.src;

interface NewsSectionProps {
  /** Статті для карток (сторінка бере їх з бази) */
  articles: Article[];
}

const NewsSection = ({ articles: news }: NewsSectionProps) => {
  return (
    <section id="news" className="news" aria-labelledby="news-title">
      <div className="container">
        <header className="news__header">
          <Rubricator icon={newspaperIcon}>Новини</Rubricator>
          <h2 id="news-title" className="section-title news__title">
            Церковні події, <span className="section-title__accent">служіння та ініціативи</span>
          </h2>
        </header>

        <ul className="news__list">
          {news.map((item) => (
            <li key={item.slug} className="news__card">
              <img className="news__image" src={item.cover.src} alt="" loading="lazy" />

              <div className="news__body">
                <p className="news__read-time">
                  <img src={bookIcon} width={16} height={16} alt="" />
                  {item.readTime}
                </p>

                <ul className="news__tags" aria-label="Теги">
                  {item.tags.map((tag) => (
                    <li key={tag} className="news__tag">
                      {tag}
                    </li>
                  ))}
                </ul>

                <h3 className="news__card-title">
                  {/* Посилання розтягнуте на всю картку (::after) */}
                  <a className="news__link" href={articleHref(item.slug)}>
                    {item.title}
                  </a>
                </h3>

                <footer className="news__meta">
                  <div className="news__author">
                    <img className="news__avatar" src={item.author.photo} alt="" loading="lazy" />
                    <div>
                      <p className="news__author-name">{item.author.name}</p>
                      <p className="news__author-role">{item.author.role}</p>
                    </div>
                  </div>
                  <time className="news__date" dateTime={item.date}>
                    {item.dateLabel}
                  </time>
                </footer>
              </div>
            </li>
          ))}
        </ul>

        <div className="news__more">
          <BlackButton text="Часопис новин" href="#news" />
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
