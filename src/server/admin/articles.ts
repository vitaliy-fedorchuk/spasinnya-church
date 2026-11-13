import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";
import type { Prisma } from "../../generated/prisma/client";
import { articleInclude, toArticle } from "../articles";
import type { EditorArticle } from "@/features/blog/editor";
import { getArticleHistory } from "./history";

export type ArticleFilter = "all" | "published" | "scheduled" | "draft";

/** Стан статті для адмінки: опублікована / запланована (дата в майбутньому) / чернетка */
export type ArticleState = Exclude<ArticleFilter, "all">;

const whereFor = (filter: ArticleFilter, now: Date): Prisma.ArticleWhereInput => {
  switch (filter) {
    case "published":
      return { status: "PUBLISHED", publishedAt: { lte: now } };
    case "scheduled":
      return { status: "PUBLISHED", publishedAt: { gt: now } };
    case "draft":
      return { status: "DRAFT" };
    default:
      return {};
  }
};

const stateOf = (a: { status: "DRAFT" | "PUBLISHED"; publishedAt: Date | null }, now: Date): ArticleState =>
  a.status === "DRAFT" ? "draft" : a.publishedAt && a.publishedAt > now ? "scheduled" : "published";

export type ArticleSort = "updated" | "published" | "title";
export const ADMIN_PAGE_SIZE = 20;

export interface ArticleListQuery {
  filter?: ArticleFilter;
  q?: string;
  year?: number;
  tag?: string;
  authorId?: string;
  sort?: ArticleSort;
  page?: number;
}

/**
 * Список статей для адмінки: стан, пошук, рік, тег, сортування, сторінки.
 * Рік рахується за датою публікації, а для чернеток без дати — за датою створення.
 */
export const listAdminArticles = async ({
  filter = "all",
  q = "",
  year,
  tag,
  authorId,
  sort = "updated",
  page = 1,
}: ArticleListQuery) => {
  await requireUser();
  const now = new Date();

  // Усе, крім вкладки стану: від цього рахуються лічильники вкладок
  const base: Prisma.ArticleWhereInput[] = [];
  if (q) base.push({ title: { contains: q, mode: "insensitive" } });
  if (tag) base.push({ tags: { has: tag } });
  if (authorId) base.push({ authorId });
  if (year) {
    const from = new Date(year, 0, 1);
    const to = new Date(year + 1, 0, 1);
    base.push({
      OR: [
        { publishedAt: { gte: from, lt: to } },
        { publishedAt: null, createdAt: { gte: from, lt: to } },
      ],
    });
  }
  const where: Prisma.ArticleWhereInput = { AND: [...base, whereFor(filter, now)] };

  const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
    sort === "title"
      ? [{ title: "asc" }]
      : sort === "published"
        ? [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
        : [{ updatedAt: "desc" }];

  const [total, rows, counts, years, tags, authors] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy,
      skip: (Math.max(1, page) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        coverSrc: true,
        author: { select: { name: true } },
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
    }),
    Promise.all(
      (["all", "published", "scheduled", "draft"] as const).map((f) =>
        db.article.count({ where: { AND: [...base, whereFor(f, now)] } }),
      ),
    ),
    db.$queryRaw<{ y: number }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM COALESCE("publishedAt", "createdAt"))::int AS y
      FROM "Article" ORDER BY y DESC`,
    db.$queryRaw<{ t: string }[]>`SELECT DISTINCT unnest(tags) AS t FROM "Article" ORDER BY t`,
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return {
    articles: rows.map((r) => ({ ...r, state: stateOf(r, now) })),
    counts: { all: counts[0], published: counts[1], scheduled: counts[2], draft: counts[3] },
    total,
    pages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    years: years.map((r) => r.y),
    tags: tags.map((r) => r.t),
    authors,
  };
};

export type AdminArticleRow = Awaited<ReturnType<typeof listAdminArticles>>["articles"][number];

/** Стаття для редактора — у форматі EditorArticle + службові поля */
export const getArticleForEditor = async (id: string) => {
  await requireUser();
  const row = await db.article.findUnique({ where: { id } });
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    history: await getArticleHistory(row.id),
    article: {
      title: row.title,
      slug: row.slug,
      authorId: row.authorId,
      tags: row.tags,
      coverSrc: row.coverSrc,
      coverAlt: row.coverAlt,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      seoTitle: row.seoTitle ?? "",
      seoDescription: row.seoDescription ?? "",
      // Блоки чернетки можуть бути недописаними — віддаємо як є
      blocks: Array.isArray(row.blocks) ? (row.blocks as unknown as EditorArticle["blocks"]) : [],
    } satisfies EditorArticle,
  };
};

export const listAuthors = async () => {
  await requireUser();
  return db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, role: true } });
};

/** Попередній перегляд: будь-яка стаття (і чернетка) у вигляді сторінки сайту */
export const getArticleForPreview = async (id: string) => {
  await requireUser();
  const row = await db.article.findUnique({ where: { id }, include: articleInclude });
  return row ? { article: toArticle(row), status: row.status } : null;
};
