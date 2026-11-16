import "server-only";
import { db } from "./db";
import { articleInclude, describeArticle, isoDate, publishedWhere, TIME_ZONE, toArticle } from "./articles";
import { PAGE_SIZE, type ArchiveParams } from "../features/blog-archive/params";
import type { Article } from "../features/blog";

export interface ArchiveArticle extends Article {
  excerpt: string;
  /** «12» */
  day: string;
  /** «нд» */
  weekday: string;
  /** «2025-12» */
  monthKey: string;
}

export interface ArchiveData {
  /** Статті для показу (у режимі стрічки — перші n) */
  articles: ArchiveArticle[];
  /** Скільки всього статей під фільтрами */
  total: number;
  /** Чи є ще статті після показаних (кнопка «Старіші новини») */
  hasMore: boolean;
  /** Скільки статей у кожному місяці стрічки — для заголовків місяців */
  monthCounts: Record<string, number>;
  /** Рубрики з кількістю (з урахуванням інших фільтрів) */
  rubrics: { tag: string; count: number }[];
  /** Скільки статей без фільтра рубрики */
  rubricsTotal: number;
  authors: { id: string; name: string; role: string; photo: string; count: number }[];
  /** Календар: рік і кількість статей по 12 місяцях */
  calendar: { year: number; counts: number[]; minYear: number; maxYear: number };
  /** Обраний місяць: сусідні місяці зі статтями */
  monthNav: { prev?: string; next?: string };
  /** Для шапки */
  stats: { articles: number; rubrics: number; authors: number; years: number };
  /** Найсвіжіша стаття (без урахування фільтрів) */
  latest: Article | null;
  /** Найбільші рубрики — швидкі посилання в шапці */
  heroRubrics: string[];
}

const weekdayFmt = new Intl.DateTimeFormat("uk-UA", { weekday: "short", timeZone: TIME_ZONE });

/** Пошук: назва, теги й увесь текст блоків (jsonb як текст — для церковного блогу цього досить) */
const searchIds = async (q: string) => {
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Article"
    WHERE status = 'PUBLISHED'
      AND (title ILIKE ${like} OR array_to_string(tags, ' ') ILIKE ${like} OR blocks::text ILIKE ${like})`;
  return new Set(rows.map((r) => r.id));
};

const countBy = <T>(items: T[], keys: (item: T) => string[]) => {
  const map = new Map<string, number>();
  for (const item of items) for (const k of keys(item)) map.set(k, (map.get(k) ?? 0) + 1);
  return map;
};

export const getBlogArchive = async (p: ArchiveParams): Promise<ArchiveData> => {
  // Легкий зріз усіх опублікованих статей: лічильники й календар рахуємо
  // в памʼяті (статей у церковному блозі сотні, не мільйони), а повні
  // статті з блоками тягнемо лише для тих, що на екрані.
  const [meta, found, authorRows, latestRow] = await Promise.all([
    db.article.findMany({
      where: publishedWhere(),
      select: { id: true, publishedAt: true, tags: true, authorId: true },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    }),
    p.q ? searchIds(p.q) : null,
    db.author.findMany({ select: { id: true, name: true, role: true, photo: true } }),
    db.article.findFirst({ where: publishedWhere(), orderBy: { publishedAt: "desc" }, include: articleInclude }),
  ]);

  const rows = meta.map((m) => ({ ...m, month: isoDate(m.publishedAt!).slice(0, 7) }));
  type Row = (typeof rows)[number];

  const byQ = (r: Row) => !found || found.has(r.id);
  const byTag = (r: Row) => !p.tag || r.tags.includes(p.tag);
  const byAuthor = (r: Row) => !p.author || r.authorId === p.author;
  const byMonth = (r: Row) => !p.month || r.month === p.month;

  // Кожен блок фільтрів рахує кількість з урахуванням усіх ІНШИХ фільтрів
  const forRubrics = rows.filter((r) => byQ(r) && byAuthor(r) && byMonth(r));
  const forAuthors = rows.filter((r) => byQ(r) && byTag(r) && byMonth(r));
  const forCalendar = rows.filter((r) => byQ(r) && byTag(r) && byAuthor(r));
  const result = forCalendar.filter(byMonth);

  const tagCounts = countBy(forRubrics, (r) => r.tags);
  const allTags = countBy(rows, (r) => r.tags);
  const rubrics = [...allTags.keys()]
    .map((tag) => ({ tag, count: tagCounts.get(tag) ?? 0 }))
    .sort(
      (a, b) =>
        b.count - a.count || (allTags.get(b.tag) ?? 0) - (allTags.get(a.tag) ?? 0) || a.tag.localeCompare(b.tag, "uk"),
    );

  const authorCounts = countBy(forAuthors, (r) => [r.authorId]);
  const writing = new Set(rows.map((r) => r.authorId));
  const authors = authorRows
    .filter((a) => writing.has(a.id))
    .map((a) => ({ ...a, count: authorCounts.get(a.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "uk"));

  // Календар: роки, де взагалі є статті; відкритий — рік обраного місяця,
  // або з адреси, або найсвіжіший
  const years = rows.map((r) => Number(r.month.slice(0, 4)));
  const nowYear = Number(isoDate(new Date()).slice(0, 4));
  const maxYear = years.length ? Math.max(...years) : nowYear;
  const minYear = years.length ? Math.min(...years) : nowYear;
  const latestYear = forCalendar.length ? Number(forCalendar[0].month.slice(0, 4)) : maxYear;
  const year = Math.min(maxYear, Math.max(minYear, p.month ? Number(p.month.slice(0, 4)) : (p.year ?? latestYear)));
  const counts = Array.from({ length: 12 }, () => 0);
  for (const r of forCalendar) if (r.month.startsWith(`${year}-`)) counts[Number(r.month.slice(5)) - 1]++;

  // Сусідні місяці, де під поточними фільтрами є статті
  const monthKeys = [...new Set(forCalendar.map((r) => r.month))]; // від нових до старих
  const monthNav: ArchiveData["monthNav"] = {};
  if (p.month) {
    monthNav.next = [...monthKeys].reverse().find((k) => k > p.month!);
    monthNav.prev = monthKeys.find((k) => k < p.month!);
  }

  // У режимі місяця показуємо його весь; у стрічці — перші n
  const limit = p.month ? result.length : (p.n ?? PAGE_SIZE);
  const shown = result.slice(0, limit);
  const full = await db.article.findMany({
    where: { id: { in: shown.map((r) => r.id) } },
    include: articleInclude,
  });
  const order = new Map(shown.map((r, i) => [r.id, i]));
  full.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  const articles = full.map((row) => {
    const article = toArticle(row);
    return {
      ...article,
      excerpt: describeArticle(article, 180),
      day: String(Number(article.date.slice(8, 10))),
      weekday: weekdayFmt.format(row.publishedAt!).replace(".", ""),
      monthKey: article.date.slice(0, 7),
    };
  });

  return {
    articles,
    total: result.length,
    hasMore: result.length > shown.length,
    monthCounts: Object.fromEntries(countBy(result, (r) => [r.month])),
    rubrics,
    rubricsTotal: forRubrics.length,
    authors,
    calendar: { year, counts, minYear, maxYear },
    monthNav,
    stats: { articles: rows.length, rubrics: allTags.size, authors: writing.size, years: new Set(years).size },
    latest: latestRow ? toArticle(latestRow) : null,
    heroRubrics: [...allTags.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag),
  };
};
