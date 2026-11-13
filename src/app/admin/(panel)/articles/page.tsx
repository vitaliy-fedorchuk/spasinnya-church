import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { articleHref } from "@/features/blog";
import { variantOf } from "@/features/media/urls";
import {
  listAdminArticles,
  type ArticleFilter,
  type ArticleSort,
  type ArticleState,
} from "@/server/admin/articles";
import { createArticle } from "@/server/admin/article-actions";
import { Icon } from "../icons";
import { AutoSelect, ViewToggle } from "./ListControls";
import { VIEW_COOKIE } from "./view";
import "./articles.scss";

export const metadata: Metadata = { title: "Статті" };

const TABS: { filter: ArticleFilter; label: string }[] = [
  { filter: "all", label: "Усі" },
  { filter: "published", label: "Опубліковані" },
  { filter: "scheduled", label: "Заплановані" },
  { filter: "draft", label: "Чернетки" },
];

const SORTS: { sort: ArticleSort; label: string }[] = [
  { sort: "updated", label: "Нещодавно змінені" },
  { sort: "published", label: "За датою публікації" },
  { sort: "title", label: "За назвою (А–Я)" },
];

const STATE_LABEL: Record<ArticleState, string> = {
  published: "Опубліковано",
  scheduled: "Заплановано",
  draft: "Чернетка",
};

const TZ = "Europe/Kyiv";
const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
const formatShort = (d: Date) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric", timeZone: TZ })
    .format(d)
    .replace(/\s*р\.$/, "");
// «Листопад 2026» — заголовок групи
const monthLabel = (d: Date) => {
  const s = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric", timeZone: TZ })
    .format(d)
    .replace(/\s*р\.$/, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const pick = <T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = pick(params.filter, ["all", "published", "scheduled", "draft"] as const, "all");
  const sort = pick(params.sort, ["updated", "published", "title"] as const, "updated");
  const q = (params.q ?? "").trim().slice(0, 100);
  const tag = (params.tag ?? "").slice(0, 40);
  const year = Number(params.year) || undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const savedView = (await cookies()).get(VIEW_COOKIE)?.value;
  const view = pick(params.view ?? savedView, ["list", "grid"] as const, "list");

  const { articles, counts, total, pages, years, tags } = await listAdminArticles({ filter, q, year, tag, sort, page });

  /** Адреса з поточними параметрами + змінами (сторінка скидається, якщо міняють фільтр) */
  const hrefWith = (change: Record<string, string | number | undefined>) => {
    const next: Record<string, string | number | undefined> = { filter, q, year, tag, sort, view, page, ...change };
    if (!("page" in change)) next.page = undefined;
    const defaults: Record<string, unknown> = { filter: "all", sort: "updated", view: "list", page: 1 };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined && v !== "" && defaults[k] !== v) sp.set(k, String(v));
    }
    const s = sp.toString();
    return `/admin/articles${s ? `?${s}` : ""}`;
  };

  // Групи за місяцем (коли сортуємо за датою) — як «папки» по роках і місяцях
  const groupDate = (a: (typeof articles)[number]) => (sort === "published" ? (a.publishedAt ?? a.createdAt) : a.updatedAt);
  const groups: { label: string | null; items: typeof articles }[] = [];
  for (const a of articles) {
    const label = sort === "title" ? null : monthLabel(groupDate(a));
    const last = groups.at(-1);
    if (last && last.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }

  const hasFilters = !!(q || tag || year);

  return (
    <>
      <header className="a-page-head">
        <h1 className="a-page-head__title">Статті</h1>
        <form action={createArticle}>
          <button type="submit" className="a-btn a-btn--primary">
            <Icon name="newArticle" />
            Нова стаття
          </button>
        </form>
      </header>

      <nav className="articles__tabs" aria-label="Стан статей">
        {TABS.map((t) => (
          <Link
            key={t.filter}
            href={hrefWith({ filter: t.filter })}
            className={`articles__tab ${t.filter === filter ? "articles__tab--active" : ""}`.trim()}
            aria-current={t.filter === filter ? "page" : undefined}
          >
            {t.label}
            <span className="articles__tab-count">{counts[t.filter]}</span>
          </Link>
        ))}
      </nav>

      {/* Фільтри — звичайна GET-форма: працює і без JavaScript, адресу можна зберегти */}
      <form className="articles__filters" role="search">
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        {view !== "list" && <input type="hidden" name="view" value={view} />}

        <label className="articles__search">
          <Icon name="search" />
          <span className="visually-hidden">Пошук за назвою</span>
          <input className="a-input" type="search" name="q" placeholder="Пошук за назвою…" defaultValue={q} />
        </label>

        <AutoSelect name="year" value={year ? String(year) : ""} label="Рік">
          <option value="">Усі роки</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </AutoSelect>

        <AutoSelect name="tag" value={tag} label="Тег">
          <option value="">Усі теги</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </AutoSelect>

        <AutoSelect name="sort" value={sort} label="Сортування">
          {SORTS.map((s) => (
            <option key={s.sort} value={s.sort}>
              {s.label}
            </option>
          ))}
        </AutoSelect>

        <ViewToggle view={view} hrefFor={{ list: hrefWith({ view: "list", page }), grid: hrefWith({ view: "grid", page }) }} />
      </form>

      {hasFilters && (
        <p className="articles__found">
          Знайдено: {total}
          <Link href={hrefWith({ q: undefined, tag: undefined, year: undefined })} className="articles__reset">
            Скинути фільтри
          </Link>
        </p>
      )}

      {articles.length === 0 ? (
        <div className="articles__empty">{hasFilters ? "Нічого не знайдено." : "Тут поки порожньо."}</div>
      ) : (
        groups.map((g, gi) => (
          <section key={gi} className="articles__group">
            {g.label && <h2 className="articles__group-title">{g.label}</h2>}

            {view === "grid" ? (
              <ul className="articles__grid">
                {g.items.map((a) => (
                  <li key={a.id} className="articles__card">
                    <div className="articles__card-cover">
                      {a.coverSrc ? <img src={variantOf(a.coverSrc, 480)} alt="" loading="lazy" /> : <Icon name="image" />}
                      <span className={`a-badge a-badge--${a.state}`}>{STATE_LABEL[a.state]}</span>
                    </div>
                    <div className="articles__card-body">
                      <Link className="articles__title" href={`/admin/articles/${a.id}`}>
                        {a.title || "Без назви"}
                      </Link>
                      <p className="articles__meta">
                        {a.publishedAt ? formatShort(a.publishedAt) : "Без дати"} · {a.author.name}
                      </p>
                      <p className="articles__editor">
                        <Icon name="edit" />
                        {a.updatedBy?.name ?? "—"} · {formatShort(a.updatedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="articles__list">
                {g.items.map((a) => (
                  <li key={a.id} className="articles__row">
                    {a.coverSrc ? (
                      <img className="articles__cover" src={variantOf(a.coverSrc, 480)} alt="" loading="lazy" />
                    ) : (
                      <span className="articles__cover articles__cover--empty">
                        <Icon name="image" />
                      </span>
                    )}

                    <div className="articles__main">
                      <Link className="articles__title" href={`/admin/articles/${a.id}`}>
                        {a.title || "Без назви"}
                      </Link>
                      <p className="articles__meta">
                        /blog/{a.slug} · {a.author.name}
                        {a.tags.length > 0 && ` · ${a.tags.join(", ")}`}
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
                        <dd>
                          {formatDate(a.updatedAt)}
                          {a.updatedBy && <span className="articles__who"> · {a.updatedBy.name}</span>}
                        </dd>
                      </div>
                    </dl>

                    <div className="articles__actions">
                      <Link className="articles__action" href={`/admin/articles/${a.id}`}>
                        <Icon name="edit" />
                        Редагувати
                      </Link>
                      {a.state === "published" && (
                        <a className="articles__action" href={articleHref(a.slug)} target="_blank" rel="noreferrer">
                          <Icon name="external" />
                          На сайті
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}

      {pages > 1 && (
        <nav className="articles__pages" aria-label="Сторінки">
          {page > 1 && (
            <Link className="articles__page" href={hrefWith({ page: page - 1 })}>
              ← Новіші
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
            .map((n, i, list) => (
              <span key={n} className="articles__page-wrap">
                {i > 0 && n - list[i - 1] > 1 && <span className="articles__page-gap">…</span>}
                <Link
                  className={`articles__page ${n === page ? "is-current" : ""}`.trim()}
                  href={hrefWith({ page: n })}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </Link>
              </span>
            ))}
          {page < pages && (
            <Link className="articles__page" href={hrefWith({ page: page + 1 })}>
              Старіші →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
