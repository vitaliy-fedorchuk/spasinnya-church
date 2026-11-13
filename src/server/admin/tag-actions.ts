"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth/session";

export type TagResult = { ok: true; changed: number } | { ok: false; error: string };

const tagName = z.string().trim().min(1, "Назва тегу порожня").max(40, "Задовга назва тегу");

/**
 * Замінити теги `from` на `to` в усіх статтях. Якщо в статті вже був `to` —
 * дублікатів не буде; порядок тегів зберігається. Це і перейменування
 * (один тег), і обʼєднання (кілька тегів в один).
 */
const replaceTags = async (from: string[], to: string): Promise<number> => {
  const changed = await db.$executeRaw`
    UPDATE "Article" a
    SET tags = (
      SELECT COALESCE(array_agg(t ORDER BY first_pos), '{}')
      FROM (
        SELECT CASE WHEN x = ANY(${from}) THEN ${to} ELSE x END AS t, MIN(pos) AS first_pos
        FROM unnest(a.tags) WITH ORDINALITY AS u(x, pos)
        GROUP BY 1
      ) s
    )
    WHERE a.tags && ${from}::text[]`;
  return changed;
};

/** Перейменувати тег (на вже існуючу назву — фактично обʼєднати) */
export async function renameTag(from: string, to: string): Promise<TagResult> {
  await requireUser();
  const parsed = tagName.safeParse(to);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (parsed.data === from) return { ok: true, changed: 0 };
  return { ok: true, changed: await replaceTags([from], parsed.data) };
}

/** Обʼєднати кілька тегів в один (наприклад, «молодь», «Молодь», «Молодіжне» → «Молодь») */
export async function mergeTags(sources: string[], target: string): Promise<TagResult> {
  await requireUser();
  const parsed = tagName.safeParse(target);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const from = z.array(z.string().max(40)).min(1).max(100).parse(sources);
  return { ok: true, changed: await replaceTags(from, parsed.data) };
}

/** Прибрати тег з усіх статей */
export async function deleteTag(tag: string): Promise<TagResult> {
  await requireUser();
  const changed = await db.$executeRaw`
    UPDATE "Article" SET tags = array_remove(tags, ${tag}) WHERE ${tag} = ANY(tags)`;
  return { ok: true, changed };
}
