import { z } from "zod";

/**
 * Стаття блогу = шапка (метадані) + масив блоків.
 *
 * Тут — єдине джерело правди про блоки: zod-схеми. З них виводяться
 * TypeScript-типи, і ними ж перевіряються дані — при збереженні з адмінки
 * і при читанні з бази (зламаний блок не потрапить на сторінку).
 *
 * Кожен блок має `id` (стабільний ключ для React і для адмінки: перетягування,
 * редагування) і `type`, від якого залежать решта полів.
 * Щоб додати новий вид блоку:
 *   1) описати схему тут і додати в `articleBlockSchema`;
 *   2) зробити компонент у ./blocks;
 *   3) зареєструвати в ./blocks/registry.ts.
 *
 * Текстові поля підтримують простий інлайн-формат (див. ./blocks/InlineText.tsx):
 * **жирний**, *курсив*, [посилання](https://...).
 */

const text = z.string().trim().min(1);
const id = z.string().min(1);

export const imageDataSchema = z.object({
  src: text,
  /** Опис для скрінрідерів; порожній — якщо фото суто декоративне */
  alt: z.string(),
});

/** Ліде — збільшений вступний абзац */
export const leadBlockSchema = z.object({ id, type: z.literal("lead"), text });

/** Звичайний текст: один або кілька абзаців */
export const textBlockSchema = z.object({
  id,
  type: z.literal("text"),
  paragraphs: z.array(text).min(1),
});

/** Підзаголовок усередині статті: 2 — розділ, 3 — підрозділ */
export const headingBlockSchema = z.object({
  id,
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text,
});

/** Цитата людини (role — посада / підпис під автором) */
export const quoteBlockSchema = z.object({
  id,
  type: z.literal("quote"),
  text,
  author: z.string().optional(),
  role: z.string().optional(),
});

/** Біблійний вірш — окремий акцентний блок; reference — напр. «Івана 3:16» */
export const verseBlockSchema = z.object({
  id,
  type: z.literal("verse"),
  text,
  reference: text,
});

/** Одне фото; wide — ширше за колонку тексту */
export const imageBlockSchema = z.object({
  id,
  type: z.literal("image"),
  image: imageDataSchema,
  caption: z.string().optional(),
  wide: z.boolean().optional(),
});

/**
 * Розкладки галереї:
 *  - grid     — рівні фото сіткою;
 *  - featured — перше фото велике, решта менші поруч;
 *  - row      — усі в один ряд (для 2–4 фото).
 * Без розкладки: 3 фото — featured, решта — grid (як було спочатку).
 */
export const GALLERY_LAYOUTS = ["grid", "featured", "row"] as const;
export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number];

/** Кілька фото (2–6) у різних розкладках; на телефоні гортаються вбік */
export const galleryBlockSchema = z.object({
  id,
  type: z.literal("gallery"),
  images: z.array(imageDataSchema).min(2).max(6),
  layout: z.enum(GALLERY_LAYOUTS).optional(),
  caption: z.string().optional(),
});

/** Розкладка, яку реально малюємо (row для 5–6 фото завузький — тоді сітка) */
export const galleryLayoutOf = (count: number, layout?: GalleryLayout): GalleryLayout =>
  layout === "row" && count > 4 ? "grid" : (layout ?? (count === 3 ? "featured" : "grid"));

/** Список */
export const listBlockSchema = z.object({
  id,
  type: z.literal("list"),
  ordered: z.boolean().optional(),
  items: z.array(text).min(1),
});

/**
 * Відео з YouTube: спершу обкладинка, плеєр вантажиться по кліку.
 * youtubeId — частина після v=; poster — своя обкладинка (без неї — превʼю з YouTube).
 */
export const videoBlockSchema = z.object({
  id,
  type: z.literal("video"),
  youtubeId: z.string().regex(/^[\w-]{6,20}$/, "Невірний ID ролика YouTube"),
  poster: z.string().optional(),
  title: text,
  caption: z.string().optional(),
});

/** Виділена примітка: розклад, адреса, «як долучитися» */
export const calloutBlockSchema = z.object({
  id,
  type: z.literal("callout"),
  title: z.string().optional(),
  text,
});

/**
 * Розділювач між частинами статті:
 *  dots — три крапки; line — тонка світла лінія; dove — лінія з голубкою з логотипу;
 *  space — просто більший відступ (пауза без лінії).
 */
export const DIVIDER_STYLES = ["dots", "line", "dove", "space"] as const;
export type DividerStyle = (typeof DIVIDER_STYLES)[number];

export const dividerBlockSchema = z.object({
  id,
  type: z.literal("divider"),
  style: z.enum(DIVIDER_STYLES).optional(),
});

/** Кнопка-заклик (реєстрація, пожертва, детальніше) */
export const buttonBlockSchema = z.object({
  id,
  type: z.literal("button"),
  text,
  href: text,
  external: z.boolean().optional(),
});

export const articleBlockSchema = z.discriminatedUnion("type", [
  leadBlockSchema,
  textBlockSchema,
  headingBlockSchema,
  quoteBlockSchema,
  verseBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  listBlockSchema,
  videoBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  buttonBlockSchema,
]);

export type ImageData = z.infer<typeof imageDataSchema>;
export type LeadBlock = z.infer<typeof leadBlockSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type VerseBlock = z.infer<typeof verseBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type GalleryBlock = z.infer<typeof galleryBlockSchema>;
export type ListBlock = z.infer<typeof listBlockSchema>;
export type VideoBlock = z.infer<typeof videoBlockSchema>;
export type CalloutBlock = z.infer<typeof calloutBlockSchema>;
export type DividerBlock = z.infer<typeof dividerBlockSchema>;
export type ButtonBlock = z.infer<typeof buttonBlockSchema>;

export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type BlockType = ArticleBlock["type"];

// ---------- Стаття, як її бачать компоненти сайту ----------
// (у базі зберігається інакше — див. src/server/articles.ts, там і перетворення)

export interface Author {
  name: string;
  role: string;
  photo: string;
}

export interface Article {
  /** Частина адреси: /blog/<slug> */
  slug: string;
  title: string;
  tags: string[];
  /** ISO-дата для машин */
  date: string;
  /** «12 січня 2026» */
  dateLabel: string;
  /** «5 хв читання» — рахується з тексту блоків */
  readTime: string;
  author: Author;
  cover: ImageData;
  blocks: ArticleBlock[];
}
