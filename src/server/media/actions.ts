"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { findMediaUsage, queryMedia, toMediaItem } from "./library";
import { removeImageFiles } from "./process";

/** Для вікна «Медіатека» в редакторі */
export async function listMedia(input: { q?: string; cursor?: string }) {
  await requireUser();
  const { q, cursor } = z.object({ q: z.string().max(100).optional(), cursor: z.string().max(50).optional() }).parse(input);
  return queryMedia({ q, cursor });
}

export async function getMediaUsage(id: string) {
  await requireUser();
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return null;
  return findMediaUsage(media.path);
}

export async function updateMediaAlt(id: string, alt: string) {
  await requireUser();
  const row = await db.media.update({ where: { id }, data: { alt: z.string().trim().max(300).parse(alt) } });
  return toMediaItem(row);
}

/** Видалити фото — лише якщо воно ніде не використане */
export async function deleteMedia(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { ok: true };

  const usage = await findMediaUsage(media.path);
  const count = usage.articles.length + usage.authors.length;
  if (count > 0) {
    return { ok: false, error: `Фото використовується (${count}) — спершу приберіть його звідти` };
  }

  await db.media.delete({ where: { id } });
  await removeImageFiles(media.path);
  return { ok: true };
}
