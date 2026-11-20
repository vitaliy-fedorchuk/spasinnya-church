import "./AboutMosaic.scss";
import { srcSetOf } from "@/features/media/urls";
import type { AboutPage } from "./aboutPages";
import { AboutItem, Arrow, Soon, num } from "./parts";

/**
 * Мозаїка плиток із фото на всю плитку і текстом поверх (варіант D сторінки «Про нас»).
 * Зараз ніде не використовується — збережено на майбутнє. Розкладка розрахована
 * рівно на 7 плиток (сітка 4×3, четверта — найбільша). Мобільної версії ще немає.
 */
const AboutMosaic = ({ pages }: { pages: AboutPage[] }) => (
  <ul className="hub-d">
    {pages.map((p, i) => (
      <li key={p.title} className={`hub-d__tile hub-d__tile--${i + 1}`}>
        <AboutItem page={p} className="hub-d__link">
          <img src={p.photo} srcSet={srcSetOf(p.photo)} sizes="(min-width: 768px) 50vw, 92vw" alt="" loading="lazy" />
          <span className="hub-d__top">
            <span className="hub-d__num">{num(i)}</span>
            {p.href ? (
              <span className="hub-d__arrow">
                <Arrow />
              </span>
            ) : (
              <Soon />
            )}
          </span>
          <span className="hub-d__bottom">
            <span className="hub-d__title">{p.title}</span>
            <span className="hub-d__text">{p.text}</span>
          </span>
        </AboutItem>
      </li>
    ))}
  </ul>
);

export default AboutMosaic;
