import "server-only";
import { db } from "../db";
import { Prisma, type Media } from "../../generated/prisma/client";
import { mediaUrl, type MediaAlbumItem, type MediaFilters, type MediaItem } from "@/features/media/urls";

export const toMediaItem = (m: Media & { used?: boolean }): MediaItem => ({
  id: m.id,
  path: m.path,
  url: mediaUrl(m.path),
  thumb: mediaUrl(m.path, 480),
  width: m.width,
  height: m.height,
  bytes: m.bytes,
  originalBytes: m.originalBytes,
  alt: m.alt,
  originalName: m.originalName,
  albumId: m.albumId,
  used: m.used,
  createdAt: m.createdAt.toISOString(),
});

export const PAGE_SIZE = 48;

/**
 * «Фото десь використане»: обкладинка чи блок статті, фото автора, аватар.
 * Адреси всіх розмірів містять path, тож шукаємо за ним.
 */
const USED_SQL = Prisma.sql`(
  EXISTS (SELECT 1 FROM "Article" a
          WHERE a."coverSrc" LIKE '/uploads/' || m.path || '-%'
             OR a.blocks::text LIKE '%/uploads/' || m.path || '-%')
  OR EXISTS (SELECT 1 FROM "Author" au WHERE au.photo LIKE '/uploads/' || m.path || '-%')
  OR EXISTS (SELECT 1 FROM "User" u WHERE u.avatar LIKE '/uploads/' || m.path || '-%')
)`;

const ORDER: Record<NonNullable<MediaFilters["sort"]>, Prisma.Sql> = {
  new: Prisma.sql`m."createdAt" DESC, m.id DESC`,
  old: Prisma.sql`m."createdAt" ASC, m.id ASC`,
  name: Prisma.sql`lower(COALESCE(NULLIF(m.alt, ''), m."originalName")) ASC`,
  size: Prisma.sql`COALESCE(m."originalBytes", m.bytes) DESC`,
};

const whereSql = (f: MediaFilters) => {
  const conds: Prisma.Sql[] = [Prisma.sql`TRUE`];
  const q = f.q?.trim();
  if (q) {
    const like = `%${q}%`;
    conds.push(Prisma.sql`(m.alt ILIKE ${like} OR m."originalName" ILIKE ${like})`);
  }
  if (f.album === "none") conds.push(Prisma.sql`m."albumId" IS NULL`);
  else if (f.album && f.album !== "all") conds.push(Prisma.sql`m."albumId" = ${f.album}`);

  const period = f.period?.match(/^(\d{4})(?:-(\d{2}))?$/);
  if (period) {
    const y = Number(period[1]);
    const mo = period[2] ? Number(period[2]) - 1 : null;
    const from = mo === null ? new Date(y, 0, 1) : new Date(y, mo, 1);
    const to = mo === null ? new Date(y + 1, 0, 1) : new Date(y, mo + 1, 1);
    conds.push(Prisma.sql`m."createdAt" >= ${from} AND m."createdAt" < ${to}`);
  }

  // Квадратні — з допуском 5%
  if (f.orientation === "landscape") conds.push(Prisma.sql`m.width > m.height * 1.05`);
  if (f.orientation === "portrait") conds.push(Prisma.sql`m.height > m.width * 1.05`);
  if (f.orientation === "square")
    conds.push(Prisma.sql`m.width <= m.height * 1.05 AND m.height <= m.width * 1.05`);

  if (f.missingAlt) conds.push(Prisma.sql`m.alt = ''`);
  if (f.unused) conds.push(Prisma.sql`NOT ${USED_SQL}`);
  return Prisma.join(conds, " AND ");
};

/** Сторінка медіатеки з фільтрами */
export const queryMedia = async (f: MediaFilters) => {
  const where = whereSql(f);
  const offset = Math.max(0, f.offset ?? 0);
  const [rows, total] = await Promise.all([
    db.$queryRaw<(Media & { used: boolean })[]>`
      SELECT m.*, ${USED_SQL} AS used FROM "Media" m
      WHERE ${where}
      ORDER BY ${ORDER[f.sort ?? "new"]}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "Media" m WHERE ${where}`,
  ]);
  const count = Number(total[0]?.n ?? 0);
  return { items: rows.map(toMediaItem), total: count, nextOffset: offset + rows.length < count ? offset + rows.length : null };
};

/** Альбоми з кількістю фото й мініатюрою останнього */
export const queryAlbums = async (): Promise<MediaAlbumItem[]> => {
  const rows = await db.mediaAlbum.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { media: true } }, media: { orderBy: { createdAt: "desc" }, take: 1, select: { path: true } } },
  });
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    count: a._count.media,
    cover: a.media[0] ? mediaUrl(a.media[0].path, 480) : null,
  }));
};

/** Загальна статистика: кількість, «без альбому», скільки займає й скільки зекономлено */
export const mediaStats = async () => {
  const [row] = await db.$queryRaw<{ total: bigint; none: bigint; bytes: bigint; orig: bigint; orig_known: bigint }[]>`
    SELECT count(*) AS total,
           count(*) FILTER (WHERE "albumId" IS NULL) AS none,
           COALESCE(sum(bytes), 0) AS bytes,
           COALESCE(sum("originalBytes"), 0) AS orig,
           COALESCE(sum(bytes) FILTER (WHERE "originalBytes" IS NOT NULL), 0) AS orig_known
    FROM "Media"`;
  return {
    total: Number(row.total),
    withoutAlbum: Number(row.none),
    bytes: Number(row.bytes),
    /** Сума оригіналів і відповідних стиснених — лише там, де оригінал відомий */
    originalBytes: Number(row.orig),
    compressedOfKnown: Number(row.orig_known),
  };
};

/** Роки й місяці, за які є фото — для фільтра «Період» */
export const mediaPeriods = async () => {
  const rows = await db.$queryRaw<{ p: string }[]>`
    SELECT DISTINCT to_char("createdAt", 'YYYY-MM') AS p FROM "Media" ORDER BY p DESC`;
  return rows.map((r) => r.p);
};

/** Де використане фото: статті, автори, аватари користувачів */
export const findMediaUsage = async (path: string) => {
  const like = `%/uploads/${path}-%`;
  const prefix = `/uploads/${path}-`;
  const [articles, authors, users] = await Promise.all([
    db.$queryRaw<{ id: string; title: string }[]>`
      SELECT id, title FROM "Article"
      WHERE "coverSrc" LIKE ${like} OR blocks::text LIKE ${like}
      ORDER BY "updatedAt" DESC`,
    db.author.findMany({ where: { photo: { startsWith: prefix } }, select: { id: true, name: true } }),
    db.user.findMany({ where: { avatar: { startsWith: prefix } }, select: { id: true, name: true } }),
  ]);
  return { articles, authors, users };
};
