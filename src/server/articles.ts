import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { Prisma } from "../generated/prisma/client";
import { articleBlockSchema, type Article, type ArticleBlock } from "../features/blog/types";

const TIME_ZONE = "Europe/Kyiv";
const WORDS_PER_MINUTE = 200;

const articleInclude = { author: true } satisfies Prisma.ArticleInclude;
type ArticleRow = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>;

/** Лише опубліковані й не з майбутнього (запланована публікація) */
const publishedWhere = (): Prisma.ArticleWhereInput => ({
  status: "PUBLISHED",
  publishedAt: { lte: new Date() },
});

/**
 * Блоки з бази перевіряємо zod-схемою по одному: зламаний чи застарілий блок
 * пропускаємо (з попередженням у лог), а не валимо всю сторінку.
 */
const parseBlocks = (raw: Prisma.JsonValue, slug: string): ArticleBlock[] => {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, i) => {
    const result = articleBlockSchema.safeParse(item);
    if (result.success) return [result.data];
    console.warn(`[articles] ${slug}: блок #${i} пропущено —`, result.error.issues[0]?.message);
    return [];
  });
};

/** Увесь текст статті — для підрахунку часу читання й опису */
const blockText = (b: ArticleBlock): string => {
  switch (b.type) {
    case "lead":
    case "heading":
    case "callout":
      return b.text;
    case "quote":
    case "verse":
      return b.text;
    case "text":
      return b.paragraphs.join(" ");
    case "list":
      return b.items.join(" ");
    default:
      return "";
  }
};

const readTimeLabel = (blocks: ArticleBlock[]) => {
  const words = blocks.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  // Округлюємо вгору: 1.6 хв — це «2 хв», а не «1 хв»
  return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} хв читання`;
};

// «12 січня 2026 р.» → «12 січня 2026»
const dateLabel = (d: Date) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE })
    .format(d)
    .replace(/\s*р\.$/, "");

// ISO-дата за київським часом: 2026-01-12
const isoDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);

const toArticle = (row: ArticleRow): Article => {
  const blocks = parseBlocks(row.blocks, row.slug);
  const date = row.publishedAt ?? row.createdAt;
  return {
    slug: row.slug,
    title: row.title,
    tags: row.tags,
    date: isoDate(date),
    dateLabel: dateLabel(date),
    readTime: readTimeLabel(blocks),
    author: { name: row.author.name, role: row.author.role, photo: row.author.photo },
    cover: { src: row.coverSrc, alt: row.coverAlt },
    blocks,
  };
};

/** Останні опубліковані статті (для секції «Новини») */
export const getLatestArticles = async ({ limit = 3, excludeSlug }: { limit?: number; excludeSlug?: string } = {}) => {
  const rows = await db.article.findMany({
    where: { ...publishedWhere(), ...(excludeSlug && { slug: { not: excludeSlug } }) },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleInclude,
  });
  return rows.map(toArticle);
};

/**
 * Опублікована стаття за адресою. cache() — щоб generateMetadata і сама
 * сторінка в межах одного запиту не ходили в базу двічі.
 */
export const getArticleBySlug = cache(async (slug: string) => {
  const row = await db.article.findFirst({
    where: { slug, ...publishedWhere() },
    include: articleInclude,
  });
  if (!row) return null;
  return { article: toArticle(row), seoTitle: row.seoTitle, seoDescription: row.seoDescription };
});

/** Опис для пошуку й соцмереж — перший вступний або текстовий абзац без розмітки */
export const describeArticle = (article: Article, max = 200) => {
  const first = article.blocks.find((b) => b.type === "lead" || b.type === "text");
  const text = first ? blockText(first) : "";
  return text
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\*+/g, "")
    .slice(0, max);
};
