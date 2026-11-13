"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { findMediaUsage, mediaPeriods, mediaStats, queryAlbums, queryMedia, toMediaItem } from "./library";
import { removeImageFiles } from "./process";
import type { MediaFilters } from "@/features/media/urls";

const filtersSchema = z.object({
  q: z.string().max(100).optional(),
  album: z.string().max(50).optional(),
  period: z.string().regex(/^\d{4}(-\d{2})?$/).optional().or(z.literal("")),
  orientation: z.enum(["landscape", "portrait", "square"]).optional(),
  missingAlt: z.boolean().optional(),
  unused: z.boolean().optional(),
  sort: z.enum(["new", "old", "name", "size"]).optional(),
  offset: z.number().int().min(0).max(100000).optional(),
});

/** Фото з фільтрами (медіатека й вікно вибору в редакторі) */
export async function listMedia(filters: MediaFilters) {
  await requireUser();
  const f = filtersSchema.parse(filters);
  return queryMedia({ ...f, period: f.period || undefined });
}

/** Альбоми, статистика й періоди — для бічної панелі та фільтрів */
export async function getMediaOverview() {
  await requireUser();
  const [albums, stats, periods] = await Promise.all([queryAlbums(), mediaStats(), mediaPeriods()]);
  return { albums, stats, periods };
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

// ---------- Альбоми ----------

const albumName = z.string().trim().min(1, "Назва альбому порожня").max(80, "Задовга назва");

export async function createAlbum(name: string) {
  await requireUser();
  const album = await db.mediaAlbum.create({ data: { name: albumName.parse(name) } });
  return { id: album.id, name: album.name };
}

export async function renameAlbum(id: string, name: string) {
  await requireUser();
  await db.mediaAlbum.update({ where: { id }, data: { name: albumName.parse(name) } });
}

/** Видалити альбом. Фото лишаються в медіатеці — переходять у «Без альбому». */
export async function deleteAlbum(id: string) {
  await requireUser();
  await db.mediaAlbum.delete({ where: { id } }).catch(() => {});
}

/** Перемістити фото в альбом (null — «Без альбому») */
export async function moveMedia(ids: string[], albumId: string | null) {
  await requireUser();
  const list = z.array(z.string().max(50)).min(1).max(500).parse(ids);
  const res = await db.media.updateMany({ where: { id: { in: list } }, data: { albumId } });
  return res.count;
}

// ---------- Видалення ----------

/** Видалити фото — лише якщо воно ніде не використане */
export async function deleteMedia(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { ok: true };

  const usage = await findMediaUsage(media.path);
  const count = usage.articles.length + usage.authors.length + usage.users.length;
  if (count > 0) {
    return { ok: false, error: `Фото використовується (${count}) — спершу приберіть його звідти` };
  }

  await db.media.delete({ where: { id } });
  await removeImageFiles(media.path);
  return { ok: true };
}

/** Видалити кілька фото; ті, що десь використані, пропускаються */
export async function deleteMediaMany(ids: string[]) {
  await requireUser();
  const list = z.array(z.string().max(50)).min(1).max(500).parse(ids);
  let deleted = 0;
  let skipped = 0;
  for (const id of list) {
    const res = await deleteMedia(id);
    if (res.ok) deleted++;
    else skipped++;
  }
  return { deleted, skipped };
}
