import type { Metadata } from "next";
import Link from "next/link";
import { articleHref } from "@/features/blog";
import { listAdminArticles, type ArticleFilter, type ArticleState } from "@/server/admin/articles";
import "./articles.scss";

export const metadata: Metadata = { title: "Статті" };

const TABS: { filter: ArticleFilter; label: string }[] = [
  { filter: "all", label: "Усі" },
  { filter: "published", label: "Опубліковані" },
  { filter: "scheduled", label: "Заплановані" },
  { filter: "draft", label: "Чернетки" },
];

const STATE_LABEL: Record<ArticleState, string> = {
  published: "Опубліковано",
  scheduled: "Заплановано",
  draft: "Чернетка",
};

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(d);

const isFilter = (v: unknown): v is ArticleFilter => TABS.some((t) => t.filter === v);

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = isFilter(params.filter) ? params.filter : "all";
  const q = (params.q ?? "").trim().slice(0, 100);
  const { articles, counts } = await listAdminArticles({ filter, q });

  const tabHref = (f: ArticleFilter) => {
    const sp = new URLSearchParams();
    if (f !== "all") sp.set("filter", f);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return `/admin/articles${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <header className="a-page-head">
        <h1 className="a-page-head__title">Статті</h1>
        {/* Кнопка «Нова стаття» зʼявиться разом із редактором (етап 4) */}
      </header>

      <div className="articles__toolbar">
        <nav className="articles__tabs" aria-label="Фільтр статей">
          {TABS.map((t) => (
            <Link
              key={t.filter}
              href={tabHref(t.filter)}
              className={`articles__tab ${t.filter === filter ? "articles__tab--active" : ""}`.trim()}
              aria-current={t.filter === filter ? "page" : undefined}
            >
              {t.label}
              <span className="articles__tab-count">{counts[t.filter]}</span>
            </Link>
          ))}
        </nav>

        <form className="articles__search" role="search">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <label className="visually-hidden" htmlFor="articles-q">
            Пошук за назвою
          </label>
          <input
            id="articles-q"
            className="a-input articles__search-input"
            type="search"
            name="q"
            placeholder="Пошук за назвою…"
            defaultValue={q}
          />
        </form>
      </div>

      {articles.length === 0 ? (
        <div className="articles__empty">
          {q ? `Нічого не знайдено за запитом «${q}».` : "Тут поки порожньо."}
        </div>
      ) : (
        <ul className="articles__list">
          {articles.map((a) => (
            <li key={a.id} className="articles__row">
              <img className="articles__cover" src={a.coverSrc} alt="" loading="lazy" />

              <div className="articles__main">
                <p className="articles__title">{a.title}</p>
                <p className="articles__meta">
                  /blog/{a.slug} · {a.author.name}
                </p>
              </div>

              <span className={`a-badge a-badge--${a.state}`}>{STATE_LABEL[a.state]}</span>

              <dl className="articles__dates">
                <div>
                  <dt>Публікація</dt>
                  <dd>{a.publishedAt ? formatDate(a.publishedAt) : "—"}</dd>
                </div>
                <div>
                  <dt>Змінено</dt>
                  <dd>{formatDate(a.updatedAt)}</dd>
                </div>
              </dl>

              <div className="articles__actions">
                {a.state === "published" && (
                  <a className="articles__action" href={articleHref(a.slug)} target="_blank" rel="noreferrer">
                    На сайті ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
