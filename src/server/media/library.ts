import "server-only";
import { db } from "../db";
import { mediaUrl, type MediaItem } from "@/features/media/urls";
import type { Media } from "../../generated/prisma/client";

export const toMediaItem = (m: Media): MediaItem => ({
  id: m.id,
  path: m.path,
  url: mediaUrl(m.path),
  thumb: mediaUrl(m.path, 480),
  width: m.width,
  height: m.height,
  bytes: m.bytes,
  alt: m.alt,
  originalName: m.originalName,
  createdAt: m.createdAt.toISOString(),
});

export const PAGE_SIZE = 48;

/** Сторінка медіатеки: найновіші спершу, пошук за назвою файлу й описом */
export const queryMedia = async ({ q = "", cursor }: { q?: string; cursor?: string }) => {
  const search = q.trim();
  const rows = await db.media.findMany({
    where: search
      ? {
          OR: [
            { alt: { contains: search, mode: "insensitive" } },
            { originalName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE).map(toMediaItem);
  return { items, nextCursor: hasMore ? items.at(-1)!.id : null };
};

/**
 * Де використане фото: статті (обкладинка або будь-який блок) і автори.
 * Шукаємо за path — він входить у всі адреси розмірів.
 */
export const findMediaUsage = async (path: string) => {
  const like = `%/uploads/${path}-%`;
  const [articles, authors] = await Promise.all([
    db.$queryRaw<{ id: string; title: string }[]>`
      SELECT id, title FROM "Article"
      WHERE "coverSrc" LIKE ${like} OR blocks::text LIKE ${like}
      ORDER BY "updatedAt" DESC`,
    db.author.findMany({ where: { photo: { contains: `/uploads/${path}-` } }, select: { id: true, name: true } }),
  ]);
  return { articles, authors };
};
