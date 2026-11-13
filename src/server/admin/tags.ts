import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";

export interface TagRow {
  tag: string;
  /** Скільки статей з цим тегом */
  articles: number;
  /** З них опублікованих */
  published: number;
}

/** Усі теги з кількістю статей (теги живуть у статтях, окремої таблиці немає) */
export const listTags = async (): Promise<TagRow[]> => {
  await requireUser();
  const rows = await db.$queryRaw<{ tag: string; articles: bigint; published: bigint }[]>`
    SELECT t AS tag,
           COUNT(*) AS articles,
           COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published
    FROM "Article", unnest(tags) AS t
    GROUP BY t
    ORDER BY lower(t)`;
  return rows.map((r) => ({ tag: r.tag, articles: Number(r.articles), published: Number(r.published) }));
};

/** Лише назви — для підказок у редакторі */
export const listTagNames = async () => (await listTags()).map((t) => t.tag);
