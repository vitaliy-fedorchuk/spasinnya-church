"use server";

import { redirect } from "next/navigation";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { Prisma } from "../../generated/prisma/client";
import {
  cleanBlock,
  editorArticleSchema,
  publishIssues,
  type EditorArticle,
  type EditorIssue,
} from "@/features/blog/editor";
import type { ArticleBlock } from "@/features/blog/types";
import { getArticleHistory, logArticleEvent, type HistoryEntry } from "./history";

export type SaveResult =
  | { ok: true; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; updatedAt: string; history: HistoryEntry[] }
  | { ok: false; issues: EditorIssue[] };

const fail = (message: string, field?: string): SaveResult => ({ ok: false, issues: [{ message, field }] });

/** «Нова стаття»: порожня чернетка → одразу в редактор */
export async function createArticle() {
  const user = await requireUser();

  const author =
    (await db.author.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await db.author.create({ data: { name: user.name, role: "", photo: "" } }));

  // Тимчасова унікальна адреса — замінюється адресою з назви
  const article = await db.article.create({
    data: {
      title: "",
      slug: `chernetka-${Date.now().toString(36)}`,
      coverSrc: "",
      authorId: author.id,
      blocks: [],
      createdById: user.id,
      updatedById: user.id,
    },
  });
  await logArticleEvent(article.id, user.id, "CREATED");

  redirect(`/admin/articles/${article.id}`);
}

const toData = (a: EditorArticle, blocks: ArticleBlock[]) => ({
  title: a.title.trim(),
  slug: a.slug.trim(),
  authorId: a.authorId,
  tags: [...new Set(a.tags.map((t) => t.trim()).filter(Boolean))],
  coverSrc: a.coverSrc.trim(),
  coverAlt: a.coverAlt.trim(),
  seoTitle: a.seoTitle.trim() || null,
  seoDescription: a.seoDescription.trim() || null,
  // Дата публікації зберігається і для чернетки — це запланована дата
  publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
  blocks: blocks as Prisma.InputJsonValue,
});

const resultOf = async (row: {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  updatedAt: Date;
}): Promise<SaveResult> => ({
  ok: true,
  status: row.status,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  updatedAt: row.updatedAt.toISOString(),
  history: await getArticleHistory(row.id),
});

/** Унікальність адреси — зрозумілим текстом замість помилки бази */
const isSlugTaken = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

/**
 * Зберегти. Чернетку — як є (можна недописану). Опубліковану — лише якщо
 * вона й далі проходить повну перевірку: зміни одразу видно на сайті.
 */
export async function saveArticle(id: string, input: unknown): Promise<SaveResult> {
  const user = await requireUser();
  const parsed = editorArticleSchema.safeParse(input);
  if (!parsed.success) return fail("Дані статті пошкоджені — оновіть сторінку");

  const article = parsed.data as EditorArticle;
  const current = await db.article.findUnique({ where: { id }, select: { status: true } });
  if (!current) return fail("Статтю не знайдено — можливо, її видалили");

  let blocks = article.blocks;
  if (current.status === "PUBLISHED") {
    const issues = publishIssues(article);
    if (issues.length) return { ok: false, issues };
    blocks = blocks.map(cleanBlock);
  }
  const data = toData(article, blocks);
  // Порожня адреса (стерли назву) — лишаємо стару: інакше дві такі чернетки зіткнулися б
  if (!data.slug) delete (data as Partial<typeof data>).slug;
  // Опублікована стаття без дати — лишаємо стару, а не стираємо
  if (current.status === "PUBLISHED" && !data.publishedAt) delete (data as Partial<typeof data>).publishedAt;

  try {
    const row = await db.article.update({ where: { id }, data: { ...data, updatedById: user.id } });
    await logArticleEvent(id, user.id, "EDITED");
    return resultOf(row);
  } catch (e) {
    if (isSlugTaken(e)) return fail("Стаття з такою адресою вже є", "slug");
    throw e;
  }
}

/** Опублікувати (або перенести дату публікації). publishedAt: null → зараз */
export async function publishArticle(id: string, input: unknown): Promise<SaveResult> {
  const user = await requireUser();
  const parsed = editorArticleSchema.safeParse(input);
  if (!parsed.success) return fail("Дані статті пошкоджені — оновіть сторінку");

  const article = parsed.data as EditorArticle;
  const issues = publishIssues(article);
  if (issues.length) return { ok: false, issues };

  try {
    const row = await db.article.update({
      where: { id },
      data: {
        ...toData(article, article.blocks.map(cleanBlock)),
        status: "PUBLISHED",
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        updatedById: user.id,
      },
    });
    await logArticleEvent(id, user.id, "PUBLISHED");
    return resultOf(row);
  } catch (e) {
    if (isSlugTaken(e)) return fail("Стаття з такою адресою вже є", "slug");
    throw e;
  }
}

/** Зняти з публікації — стаття стає чернеткою і зникає з сайту */
export async function unpublishArticle(id: string): Promise<SaveResult> {
  const user = await requireUser();
  const row = await db.article.update({ where: { id }, data: { status: "DRAFT", updatedById: user.id } });
  await logArticleEvent(id, user.id, "UNPUBLISHED");
  return resultOf(row);
}

export async function deleteArticle(id: string) {
  await requireUser();
  await db.article.delete({ where: { id } }).catch(() => {});
  redirect("/admin/articles");
}
