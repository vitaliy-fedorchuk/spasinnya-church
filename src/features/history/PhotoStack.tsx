import { srcSetOf } from "@/features/media/urls";
import { zoomProps } from "@/features/media/zoom";

export interface StackPhoto {
  src: string;
  alt: string;
}

/**
 * Мозаїка фото, що відкриваються на весь екран (лайтбокс гортає всі).
 * Видно до `visible` фото; якщо їх більше — на останньому плитка «+N фото»,
 * а решта лежить прихована в розмітці (щоб лайтбокс їх гортав).
 * Розкладка задається кількістю видимих: 5 — велике + 4, 7 — велике + 4 + 2 широкі.
 */
const PhotoStack = ({ photos, visible = 7 }: { photos: StackPhoto[]; visible?: number }) => {
  const shown = photos.slice(0, visible);
  const hidden = photos.slice(visible);

  return (
    <div className="photo-stack">
      <ul className="photo-stack__grid" data-count={shown.length}>
        {shown.map((p, i) => {
          const isLast = i === shown.length - 1;
          return (
            <li key={p.src + i} className="photo-stack__item">
              <img
                src={p.src}
                srcSet={srcSetOf(p.src)}
                sizes={i === 0 ? "(max-width: 767px) 92vw, 560px" : "(max-width: 767px) 46vw, 280px"}
                alt={p.alt}
                loading="lazy"
                {...zoomProps(p.src, p.alt)}
              />
              {isLast && hidden.length > 0 && (
                <span className="photo-stack__more" aria-hidden="true">
                  +{hidden.length} фото
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {hidden.length > 0 && (
        <div className="photo-stack__hidden">
          {hidden.map((p, i) => (
            <img key={p.src + i} src={p.src} srcSet={srcSetOf(p.src)} sizes="40px" alt={p.alt} {...zoomProps(p.src, p.alt)} tabIndex={-1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoStack;
