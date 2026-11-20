import "./AboutHubPage.scss";
import Rubricator from "@/components/ui/Rubricator";
import { srcSetOf } from "@/features/media/urls";
// Та сама іконка, що й у рубрикатора «Про нас» на головній
import infoIconAsset from "@/assets/icons/info.svg";
import { ABOUT_PAGES } from "./aboutPages";
import { AboutItem, Arrow, Soon, num } from "./parts";

const infoIcon = infoIconAsset.src;
const HERO_PHOTO = "/uploads/2026/11/mmwl6ykhs5a536666a18b-1600.webp";

const AboutHubPage = () => {
  return (
    <main className="hub">
      <header className="hub-hero page-hero" data-surface="dark">
        <img
          className="hub-hero__bg page-hero__bg"
          src={HERO_PHOTO}
          srcSet={srcSetOf(HERO_PHOTO)}
          sizes="100vw"
          alt=""
        />
        <div className="container hub-hero__inner" data-intro>
          <Rubricator icon={infoIcon} className="rubricator--light">
            Про нас
          </Rubricator>
          <h1 className="hub-hero__title page-title">Знайомтеся з церквою «Спасіння»</h1>
          <p className="hub-hero__lead">
            У що ми віримо, що цінуємо, звідки ми прийшли і куди рухаємося. <br className="hub-br" />
            Оберіть, з чого почати.
          </p>
        </div>
      </header>

      {/* Зміст: великі рядки, при наведенні на місці опису — фото */}
      <section className="container hub-section" aria-label="Сторінки про церкву">
        <ol className="hub-b">
          {ABOUT_PAGES.map((p, i) => (
            <li key={p.title}>
              <AboutItem page={p} className="hub-b__row">
                <span className="hub-b__num">{num(i)}</span>
                <span className="hub-b__title">
                  {p.title}
                  {!p.href && <Soon />}
                </span>
                <span className="hub-b__text">{p.text}</span>
                <span className="hub-b__arrow">
                  <Arrow />
                </span>
                <img
                  className="hub-b__thumb"
                  src={p.photo}
                  srcSet={srcSetOf(p.photo)}
                  sizes="320px"
                  alt=""
                  loading="lazy"
                />
              </AboutItem>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
};

export default AboutHubPage;
