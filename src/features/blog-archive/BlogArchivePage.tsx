import "@/components/buttons/BlackButton.scss";
import "./BlogArchive.scss";
import Link from "next/link";
import Form from "next/form";
import NewsCard from "@/components/ui/NewsCard";
import bookIconAsset from "@/assets/news/book.svg";
import { articleHref, authorInitials } from "@/features/blog";
import { srcSetOf, variantOf } from "@/features/media/urls";
import type { ArchiveArticle, ArchiveData } from "@/server/blog-archive";
import { FiltersButton, FiltersPanel, FiltersSheetProvider, ViewToggle } from "./ArchiveClient";
import {
  archiveHref,
  articlesWord,
  MONTHS_SHORT,
  monthTitle,
  PAGE_SIZE,
  plural,
  type ArchiveParams,
  type ArchiveView,
} from "./params";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const bookIcon = bookIconAsset.src;

/** Фото шапки — зала, повна людей (з медіатеки) */
const HERO_PHOTO = "/uploads/2026/01/demo-news3-1600.webp";

/** Посилання на Telegram-канал церкви; порожнє — блок не показуємо */
const TELEGRAM_URL = "";

// Після зміни фільтра — до початку стрічки, а не на верх сторінки
const FEED = "#archive";

const Chevron = ({ dir }: { dir: "left" | "right" | "down" }) => (
  <svg className="archive-icon" viewBox="0 0 24 24" aria-hidden="true">
    {dir === "left" && <path d="m15 18-6-6 6-6" />}
    {dir === "right" && <path d="m9 18 6-6-6-6" />}
    {dir === "down" && <path d="M12 5v14M19 12l-7 7-7-7" />}
  </svg>
);

const SearchForm = ({ p, className }: { p: ArchiveParams; className: string }) => (
  <Form action="/blog" className={`archive-search ${className}`} role="search">
    <svg className="archive-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input type="search" name="q" defaultValue={p.q} placeholder="Пошук…" aria-label="Пошук статей" />
    {p.tag && <input type="hidden" name="tag" value={p.tag} />}
    {p.author && <input type="hidden" name="author" value={p.author} />}
    {p.month && <input type="hidden" name="month" value={p.month} />}
    {p.q && (
      <Link className="archive-search__clear" href={archiveHref(p, { q: undefined }, FEED)} aria-label="Очистити пошук">
        ×
      </Link>
    )}
  </Form>
);

/** «Старіші новини» — як BlackButton, але з Next-посиланням і стрілкою вниз */
const MoreLink = ({ href, text, keepScroll }: { href: string; text: string; keepScroll?: boolean }) => (
  <div className="black-button archive-more">
    <Link
      href={href}
      scroll={!keepScroll}
      className="black-button__link"
      style={{ backgroundColor: "#262626", color: "#fff" }}
    >
      <span className="black-button__label">
        <span className="black-button__text">{text}</span>
      </span>
      <span className="black-button__circle" style={{ backgroundColor: "#f5f5f5" }}>
        <Chevron dir="down" />
      </span>
    </Link>
  </div>
);

// ---------- Ліва панель ----------

const Sidebar = ({ p, data }: { p: ArchiveParams; data: ArchiveData }) => {
  const { calendar } = data;
  return (
    <FiltersPanel>
      <SearchForm p={p} className="archive-search--aside" />

      <section className="archive-box">
        <div className="archive-cal__head">
          {calendar.year > calendar.minYear ? (
            <Link
              className="archive-round"
              href={archiveHref(p, {
                month: undefined,
                year: calendar.year - 1,
              })}
              scroll={false}
              aria-label="Попередній рік"
            >
              <Chevron dir="left" />
            </Link>
          ) : (
            <span className="archive-round is-disabled" aria-hidden="true">
              <Chevron dir="left" />
            </span>
          )}
          <b className="archive-cal__year">{calendar.year}</b>
          {calendar.year < calendar.maxYear ? (
            <Link
              className="archive-round"
              href={archiveHref(p, {
                month: undefined,
                year: calendar.year + 1,
              })}
              scroll={false}
              aria-label="Наступний рік"
            >
              <Chevron dir="right" />
            </Link>
          ) : (
            <span className="archive-round is-disabled" aria-hidden="true">
              <Chevron dir="right" />
            </span>
          )}
        </div>

        <ul className="archive-cal">
          {calendar.counts.map((count, i) => {
            const key = `${calendar.year}-${String(i + 1).padStart(2, "0")}`;
            const active = p.month === key;
            if (!count && !active) {
              return (
                <li key={key} className="archive-cal__month is-empty">
                  <b>{MONTHS_SHORT[i]}</b>—
                </li>
              );
            }
            return (
              <li key={key}>
                <Link
                  className={`archive-cal__month${active ? " is-active" : ""}`}
                  href={archiveHref(
                    p,
                    {
                      month: active ? undefined : key,
                      year: active ? calendar.year : undefined,
                    },
                    FEED,
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${monthTitle(key)}: ${articlesWord(count)}`}
                >
                  <b>{MONTHS_SHORT[i]}</b>
                  {count}
                </Link>
              </li>
            );
          })}
        </ul>

        {p.month && (
          <Link className="archive-box__link" href={archiveHref(p, { month: undefined, year: calendar.year }, FEED)}>
            Усі місяці
          </Link>
        )}
      </section>

      <section className="archive-box">
        <h2 className="archive-box__title">Рубрики</h2>
        <ul className="archive-list">
          <li>
            <Link href={archiveHref(p, { tag: undefined }, FEED)} aria-current={!p.tag ? "page" : undefined}>
              Усі новини <span>{data.rubricsTotal}</span>
            </Link>
          </li>
          {data.rubrics.map(({ tag, count }) =>
            count || p.tag === tag ? (
              <li key={tag}>
                <Link
                  href={archiveHref(p, { tag: p.tag === tag ? undefined : tag }, FEED)}
                  aria-current={p.tag === tag ? "page" : undefined}
                >
                  {tag} <span>{count}</span>
                </Link>
              </li>
            ) : (
              <li key={tag} className="is-empty">
                {tag} <span>0</span>
              </li>
            ),
          )}
        </ul>
      </section>

      {data.authors.length > 1 || p.author ? (
        <section className="archive-box">
          <h2 className="archive-box__title">Автори</h2>
          <ul className="archive-authors">
            {data.authors.map((a) => (
              <li key={a.id}>
                <Link
                  href={archiveHref(p, { author: p.author === a.id ? undefined : a.id }, FEED)}
                  aria-current={p.author === a.id ? "page" : undefined}
                  className={!a.count && p.author !== a.id ? "is-empty" : undefined}
                >
                  {a.photo ? (
                    <img src={variantOf(a.photo, 480)} alt="" loading="lazy" />
                  ) : (
                    <span className="archive-authors__ph" aria-hidden="true">
                      {authorInitials(a.name)}
                    </span>
                  )}
                  <span>
                    <b>{a.name}</b>
                    {a.role ? `${a.role} · ` : ""}
                    {articlesWord(a.count)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        data.authors[0] && (
          <section className="archive-box">
            <h2 className="archive-box__title">Автор</h2>
            <div className="archive-authors">
              <span className="archive-authors__static">
                {data.authors[0].photo && <img src={variantOf(data.authors[0].photo, 480)} alt="" loading="lazy" />}
                <span>
                  <b>{data.authors[0].name}</b>
                  {data.authors[0].role}
                </span>
              </span>
            </div>
          </section>
        )
      )}

      {TELEGRAM_URL && (
        <section className="archive-box archive-box--dark" data-surface="dark">
          <b className="archive-tg__title">Новини в Telegram</b>
          <p className="archive-tg__text">Сповіщення про нові статті й події.</p>
          <a className="archive-tg__btn" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
            Підписатися
          </a>
        </section>
      )}
    </FiltersPanel>
  );
};

// ---------- Стрічка ----------

const ListRow = ({ a }: { a: ArchiveArticle }) => (
  <li className="archive-row">
    <div className="archive-row__date">
      <b>{a.day}</b>
      {a.weekday}
    </div>
    <img
      className="archive-row__img"
      src={a.cover.src}
      srcSet={srcSetOf(a.cover.src)}
      sizes="(max-width: 767px) 30vw, 400px"
      alt=""
      loading="lazy"
    />
    <div className="archive-row__body">
      {/* Ті самі елементи, що в картці на головній: час читання, теги-пігулки, автор */}
      <p className="archive-row__read-time">
        <img src={bookIcon} width={16} height={16} alt="" />
        {a.readTime}
      </p>
      {a.tags.length > 0 && (
        <ul className="archive-row__tags" aria-label="Теги">
          {a.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <h3 className="archive-row__title">
        <a href={articleHref(a.slug)}>{a.title}</a>
      </h3>
      {a.excerpt && <p className="archive-row__excerpt">{a.excerpt}</p>}
      <footer className="archive-row__footer">
        <div className="archive-row__author">
          {a.author.photo ? (
            <img src={variantOf(a.author.photo, 480)} alt="" loading="lazy" />
          ) : (
            <span className="archive-authors__ph" aria-hidden="true">
              {authorInitials(a.author.name)}
            </span>
          )}
          <div>
            <p className="archive-row__author-name">{a.author.name}</p>
            {a.author.role && <p className="archive-row__author-role">{a.author.role}</p>}
          </div>
        </div>
        <time className="archive-row__when" dateTime={a.date}>
          {a.dateLabel}
        </time>
      </footer>
    </div>
  </li>
);

const MonthGroup = ({
  monthKey,
  count,
  items,
  view,
  link,
}: {
  monthKey: string;
  count: number;
  items: ArchiveArticle[];
  view: ArchiveView;
  /** «Лише цей місяць» — у стрічці; у режимі місяця не потрібне */
  link?: string;
}) => {
  const [name, year] = monthTitle(monthKey).split(" ");
  return (
    <section className="archive-month" aria-label={monthTitle(monthKey)}>
      <header className="archive-month__head">
        <div>
          <h2 className="archive-month__title">
            {name} <span>{year}</span>
          </h2>
          <p className="archive-month__count">{articlesWord(count)}</p>
        </div>
        {link && (
          <Link className="archive-month__only" href={link}>
            Лише цей місяць
            <Chevron dir="right" />
          </Link>
        )}
      </header>

      {view === "list" ? (
        <ul className="archive-rows">
          {items.map((a) => (
            <ListRow key={a.slug} a={a} />
          ))}
        </ul>
      ) : (
        <ul className="archive-grid">
          {items.map((a) => (
            <NewsCard
              key={a.slug}
              article={a}
              dateBadge={{ day: a.day, weekday: a.weekday }}
              sizes="(max-width: 767px) 92vw, (max-width: 1199px) 46vw, 500px"
            />
          ))}
        </ul>
      )}
    </section>
  );
};

interface Props {
  params: ArchiveParams;
  data: ArchiveData;
  view: ArchiveView;
  authorName?: string;
}

const BlogArchivePage = ({ params: p, data, view, authorName }: Props) => {
  // Статті вже йдуть від нових до старих — групуємо по місяцях, зберігаючи порядок
  const groups: { key: string; items: ArchiveArticle[] }[] = [];
  for (const a of data.articles) {
    const last = groups.at(-1);
    if (last?.key === a.monthKey) last.items.push(a);
    else groups.push({ key: a.monthKey, items: [a] });
  }

  const activeFilters = [p.q, p.tag, p.author, p.month].filter(Boolean).length;
  const summary = [p.tag && `рубрика «${p.tag}»`, authorName && `автор: ${authorName}`, p.q && `пошук «${p.q}»`].filter(
    Boolean,
  );
  const shown = data.articles.length;

  return (
    <main className="archive">
      <header className="archive-hero" data-surface="dark">
        <img className="archive-hero__bg" src={HERO_PHOTO} srcSet={srcSetOf(HERO_PHOTO)} sizes="100vw" alt="" />

        <div className="container archive-hero__inner">
          <div className="archive-hero__main">
            <div className="archive-hero__text">
              <span className="archive-hero__badge">Часопис новин</span>
              <h1 className="archive-hero__title">Хроніка життя церкви</h1>
              <p className="archive-hero__lead">
                Служіння, події, свідчення й життя громади — усе, що відбувається в церкві, за датами.
              </p>
              {data.heroRubrics.length > 0 && (
                <ul className="archive-hero__rubrics" aria-label="Популярні рубрики">
                  {data.heroRubrics.map((tag) => (
                    <li key={tag}>
                      <Link href={archiveHref({}, { tag }, FEED)}>{tag}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {data.latest && (
              <a className="archive-hero__latest" href={articleHref(data.latest.slug)}>
                <img
                  src={data.latest.cover.src}
                  srcSet={srcSetOf(data.latest.cover.src)}
                  sizes="(max-width: 767px) 30vw, 200px"
                  alt=""
                />
                <span className="archive-hero__latest-body">
                  <span className="archive-hero__latest-label">Свіжа стаття · {data.latest.dateLabel}</span>
                  <span className="archive-hero__latest-title">{data.latest.title}</span>
                  <span className="archive-hero__latest-more">
                    Читати
                    <Chevron dir="right" />
                  </span>
                </span>
              </a>
            )}
          </div>

          <div className="archive-hero__bottom">
            <dl className="archive-hero__stats">
              <div>
                <dt>{plural(data.stats.articles, ["стаття", "статті", "статей"])}</dt>
                <dd>{data.stats.articles}</dd>
              </div>
              <div>
                <dt>{plural(data.stats.rubrics, ["рубрика", "рубрики", "рубрик"])}</dt>
                <dd>{data.stats.rubrics}</dd>
              </div>
              <div>
                <dt>{plural(data.stats.authors, ["автор", "автори", "авторів"])}</dt>
                <dd>{data.stats.authors}</dd>
              </div>
              <div>
                <dt>{plural(data.stats.years, ["рік", "роки", "років"])} історії</dt>
                <dd>{data.stats.years}</dd>
              </div>
            </dl>
            <a className="archive-hero__scroll" href="#archive">
              Гортати стрічку
              <Chevron dir="down" />
            </a>
          </div>
        </div>
      </header>

      <FiltersSheetProvider>
        <div className="container archive-layout" id="archive">
          <Sidebar p={p} data={data} />

          <div className="archive-feed">
            <div className="archive-toolbar">
              {p.month ? (
                <nav className="archive-monthnav" aria-label="Місяці">
                  {data.monthNav.prev ? (
                    <Link className="archive-chip" href={archiveHref(p, { month: data.monthNav.prev }, FEED)}>
                      <Chevron dir="left" />
                      {monthTitle(data.monthNav.prev)}
                    </Link>
                  ) : (
                    <span className="archive-chip is-disabled">
                      <Chevron dir="left" />
                      Раніше
                    </span>
                  )}
                  <span className="archive-chip is-current" aria-current="page">
                    {monthTitle(p.month)}
                    <Link href={archiveHref(p, { month: undefined }, FEED)} aria-label="Показати всі місяці">
                      ×
                    </Link>
                  </span>
                  {data.monthNav.next ? (
                    <Link className="archive-chip" href={archiveHref(p, { month: data.monthNav.next }, FEED)}>
                      {monthTitle(data.monthNav.next)}
                      <Chevron dir="right" />
                    </Link>
                  ) : (
                    <span className="archive-chip is-disabled">
                      Пізніше
                      <Chevron dir="right" />
                    </span>
                  )}
                </nav>
              ) : (
                <p className="archive-summary">
                  <b>{articlesWord(data.total)}</b>
                  {summary.length ? ` · ${summary.join(" · ")}` : " · від нових до старих"}
                </p>
              )}

              <div className="archive-toolbar__controls">
                <FiltersButton active={activeFilters} />
                <ViewToggle view={view} />
              </div>

              <SearchForm p={p} className="archive-search--toolbar" />

              {activeFilters > 0 && (
                <Link className="archive-reset" href={archiveHref({}, {}, FEED)}>
                  Скинути всі фільтри
                </Link>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="archive-empty">
                <p className="archive-empty__title">Нічого не знайдено</p>
                <p>Спробуйте інше слово чи приберіть частину фільтрів.</p>
                <Link href={archiveHref({}, {}, FEED)}>Показати всі новини</Link>
              </div>
            ) : (
              groups.map((g) => (
                <MonthGroup
                  key={g.key}
                  monthKey={g.key}
                  count={data.monthCounts[g.key] ?? g.items.length}
                  items={g.items}
                  view={view}
                  link={p.month ? undefined : archiveHref(p, { month: g.key }, FEED)}
                />
              ))
            )}

            {p.month
              ? data.monthNav.prev && (
                  <MoreLink
                    href={archiveHref(p, { month: data.monthNav.prev }, FEED)}
                    text={monthTitle(data.monthNav.prev)}
                  />
                )
              : data.hasMore && (
                  <MoreLink href={archiveHref(p, { n: shown + PAGE_SIZE })} text="Старіші новини" keepScroll />
                )}
          </div>
        </div>
      </FiltersSheetProvider>
    </main>
  );
};

export default BlogArchivePage;
