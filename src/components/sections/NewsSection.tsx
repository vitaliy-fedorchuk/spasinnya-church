import "./NewsSection.scss";
import Rubricator from "../ui/Rubricator";
import BlackButton from "../buttons/BlackButton";
import newspaperIconAsset from "../../assets/news/newspaper.svg";
import NewsCard from "../ui/NewsCard";
import type { Article } from "../../features/blog";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const newspaperIcon = newspaperIconAsset.src;

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
            <NewsCard
              key={item.slug}
              article={item}
              className="news__card"
              sizes="(max-width: 767px) 80vw, (max-width: 1199px) 50vw, 460px"
            />
          ))}
        </ul>

        <div className="news__more">
          <BlackButton text="Часопис новин" href="/blog" />
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
