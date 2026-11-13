import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";
import type { Prisma } from "../../generated/prisma/client";
import { articleInclude, toArticle } from "../articles";
import type { EditorArticle } from "@/features/blog/editor";

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

/** Список статей для адмінки з фільтром за станом і пошуком за назвою */
export const listAdminArticles = async ({ filter = "all", q = "" }: { filter?: ArticleFilter; q?: string }) => {
  await requireUser();
  const now = new Date();
  const search: Prisma.ArticleWhereInput = q ? { title: { contains: q, mode: "insensitive" } } : {};

  const [rows, counts] = await Promise.all([
    db.article.findMany({
      where: { ...whereFor(filter, now), ...search },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        coverSrc: true,
        author: { select: { name: true } },
      },
    }),
    // Лічильники для вкладок — з урахуванням пошуку
    Promise.all(
      (["all", "published", "scheduled", "draft"] as const).map((f) =>
        db.article.count({ where: { ...whereFor(f, now), ...search } }),
      ),
    ),
  ]);

  return {
    articles: rows.map((r) => ({ ...r, state: stateOf(r, now) })),
    counts: { all: counts[0], published: counts[1], scheduled: counts[2], draft: counts[3] },
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
