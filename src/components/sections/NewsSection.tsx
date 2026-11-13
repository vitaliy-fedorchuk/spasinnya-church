import "./NewsSection.scss";
import Rubricator from "../ui/Rubricator";
import BlackButton from "../buttons/BlackButton";
import newspaperIcon from "../../assets/news/newspaper.svg";
import bookIcon from "../../assets/news/book.svg";
import authorPhoto from "../../assets/news/author.webp";
// TODO: тимчасові фото — замінити на справжні з макету (ті самі імена файлів)
import news1 from "../../assets/news/news-1.webp";
import news2 from "../../assets/news/news-2.webp";
import news3 from "../../assets/news/news-3.webp";

interface NewsItem {
  title: string;
  image: string;
  readTime: string;
  tags: string[];
  /** Дата для машин (ISO) і для людей */
  date: string;
  dateLabel: string;
  href: string;
}

const AUTHOR = { name: "Климчук Микола", role: "Старший пастор", photo: authorPhoto };

const NEWS: NewsItem[] = [
  {
    title: "Святкове богослужіння з нагоди річниці Церкви",
    image: news1,
    readTime: "5 хв читання",
    tags: ["Події", "Церква", "Молодь"],
    date: "2026-01-12",
    dateLabel: "12 січня 2026",
    href: "#news",
  },
  {
    title: "Міжнародний день молитви за переслідувану церкву",
    image: news2,
    readTime: "8 хв читання",
    tags: ["Події", "Церква", "Молодь"],
    date: "2026-01-12",
    dateLabel: "12 січня 2026",
    href: "#news",
  },
  {
    title: "Старт нового сезону підліткового клубу “Connect”",
    image: news3,
    readTime: "3 хв читання",
    tags: ["Події", "Церква", "Молодь"],
    date: "2026-01-12",
    dateLabel: "12 січня 2026",
    href: "#news",
  },
];

const NewsSection = () => {
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
          {NEWS.map((item) => (
            <li key={item.title} className="news__card">
              <img className="news__image" src={item.image} alt="" loading="lazy" />

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
                  <a className="news__link" href={item.href}>
                    {item.title}
                  </a>
                </h3>

                <footer className="news__meta">
                  <div className="news__author">
                    <img className="news__avatar" src={AUTHOR.photo} alt="" loading="lazy" />
                    <div>
                      <p className="news__author-name">{AUTHOR.name}</p>
                      <p className="news__author-role">{AUTHOR.role}</p>
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
