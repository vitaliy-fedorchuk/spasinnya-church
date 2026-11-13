/**
 * Адреси фото з медіатеки. Кожне фото лежить у кількох розмірах:
 *   /uploads/2026/11/<id>-480.webp, -960, -1600, -2400
 * У статтях зберігається адреса розміру 1600 (основний), а решту
 * виводимо звідти — для srcset, мініатюр тощо.
 * Фото не з медіатеки (демо, зовнішні) лишаються як є.
 */

export const MEDIA_WIDTHS = [480, 960, 1600, 2400] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];
export const MAIN_WIDTH: MediaWidth = 1600;

const VARIANT = /^(\/uploads\/.+)-(480|960|1600|2400)\.webp$/;

export const mediaUrl = (path: string, width: MediaWidth = MAIN_WIDTH) => `/uploads/${path}-${width}.webp`;

/** Адреса іншого розміру того ж фото (або сама адреса, якщо фото не з медіатеки) */
export const variantOf = (src: string, width: MediaWidth) => {
  const m = src.match(VARIANT);
  return m ? `${m[1]}-${width}.webp` : src;
};

/** srcset для <img>: браузер сам бере розмір під екран. undefined — фото не з медіатеки. */
export const srcSetOf = (src: string) => {
  const m = src.match(VARIANT);
  return m ? MEDIA_WIDTHS.map((w) => `${m[1]}-${w}.webp ${w}w`).join(", ") : undefined;
};

/** Чи це фото з медіатеки; повертає його path */
export const mediaPathOf = (src: string) => src.match(VARIANT)?.[1].replace(/^\/uploads\//, "") ?? null;

export interface MediaItem {
  id: string;
  path: string;
  /** Основна адреса (1600) — її вставляємо в статтю */
  url: string;
  /** Мініатюра (480) */
  thumb: string;
  width: number;
  height: number;
  /** Вага найбільшого варіанта на сайті */
  bytes: number;
  /** Вага завантаженого оригіналу (для старих фото невідома) */
  originalBytes: number | null;
  alt: string;
  originalName: string;
  albumId: string | null;
  /** Чи стоїть десь (стаття, автор, аватар) — якщо відомо */
  used?: boolean;
  createdAt: string;
}

export interface MediaAlbumItem {
  id: string;
  name: string;
  count: number;
  /** Мініатюра останнього фото */
  cover: string | null;
}

export type MediaOrientation = "landscape" | "portrait" | "square";
export type MediaSort = "new" | "old" | "name" | "size";

/** Фільтри медіатеки. album: "all" — усі, "none" — без альбому, інакше id альбому */
export interface MediaFilters {
  q?: string;
  album?: string;
  /** «2026» або «2026-11» */
  period?: string;
  orientation?: MediaOrientation;
  missingAlt?: boolean;
  unused?: boolean;
  sort?: MediaSort;
  offset?: number;
}
