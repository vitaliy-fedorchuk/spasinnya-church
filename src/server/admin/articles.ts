import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";
import type { Prisma } from "../../generated/prisma/client";

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
