import "server-only";
import { db } from "../db";
import type { ArticleAction } from "../../generated/prisma/client";

/** Правки однієї людини в межах цього вікна — один запис «редагував» */
const MERGE_EDITS_MS = 30 * 60 * 1000;

export interface HistoryEntry {
  id: string;
  action: ArticleAction;
  at: string;
  userName: string | null;
}

/** Записати дію в журнал статті */
export const logArticleEvent = async (articleId: string, userId: string, action: ArticleAction) => {
  if (action === "EDITED") {
    const last = await db.articleEvent.findFirst({ where: { articleId }, orderBy: { at: "desc" } });
    if (last && last.action === "EDITED" && last.userId === userId && Date.now() - last.at.getTime() < MERGE_EDITS_MS) {
      await db.articleEvent.update({ where: { id: last.id }, data: { at: new Date() } });
      return;
    }
  }
  await db.articleEvent.create({ data: { articleId, userId, action } });
};

export const getArticleHistory = async (articleId: string, take = 20): Promise<HistoryEntry[]> => {
  const rows = await db.articleEvent.findMany({
    where: { articleId },
    orderBy: { at: "desc" },
    take,
    include: { user: { select: { name: true } } },
  });
  return rows.map((r) => ({ id: r.id, action: r.action, at: r.at.toISOString(), userName: r.user?.name ?? null }));
};
