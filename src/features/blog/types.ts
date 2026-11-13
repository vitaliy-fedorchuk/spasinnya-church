/**
 * Стаття блогу = шапка (метадані) + масив блоків.
 *
 * Кожен блок має `id` (стабільний ключ для React і для адмінки: перетягування,
 * редагування) і `type`, від якого залежать решта полів.
 * Щоб додати новий вид блоку:
 *   1) описати його тут і додати в union `ArticleBlock`;
 *   2) зробити компонент у ./blocks;
 *   3) зареєструвати в ./blocks/registry.ts.
 *
 * Текстові поля підтримують простий інлайн-формат (див. ./blocks/InlineText.tsx):
 * **жирний**, *курсив*, [посилання](https://...).
 */

export interface ImageData {
  src: string;
  /** Опис для скрінрідерів; порожній — якщо фото суто декоративне */
  alt: string;
}

/** Ліде — збільшений вступний абзац */
export interface LeadBlock {
  id: string;
  type: "lead";
  text: string;
}

/** Звичайний текст: один або кілька абзаців */
export interface TextBlock {
  id: string;
  type: "text";
  paragraphs: string[];
}

/** Підзаголовок усередині статті */
export interface HeadingBlock {
  id: string;
  type: "heading";
  /** 2 — розділ, 3 — підрозділ */
  level: 2 | 3;
  text: string;
}

/** Цитата людини */
export interface QuoteBlock {
  id: string;
  type: "quote";
  text: string;
  author?: string;
  /** Посада / підпис під автором */
  role?: string;
}

/** Біблійний вірш — окремий акцентний блок */
export interface VerseBlock {
  id: string;
  type: "verse";
  text: string;
  /** Напр. «Івана 3:16» */
  reference: string;
}

/** Одне фото */
export interface ImageBlock {
  id: string;
  type: "image";
  image: ImageData;
  caption?: string;
  /** Ширше за колонку тексту */
  wide?: boolean;
}

/** Кілька фото поряд (2–4); на телефоні гортаються вбік */
export interface GalleryBlock {
  id: string;
  type: "gallery";
  images: ImageData[];
  caption?: string;
}

/** Список */
export interface ListBlock {
  id: string;
  type: "list";
  ordered?: boolean;
  items: string[];
}

/** Відео з YouTube: спершу обкладинка, плеєр вантажиться по кліку */
export interface VideoBlock {
  id: string;
  type: "video";
  /** ID ролика на YouTube (частина після v=) */
  youtubeId: string;
  /** Своя обкладинка; без неї — превʼю з YouTube */
  poster?: string;
  title: string;
  caption?: string;
}

/** Виділена примітка: розклад, адреса, «як долучитися» */
export interface CalloutBlock {
  id: string;
  type: "callout";
  title?: string;
  text: string;
}

/** Візуальний розділювач між частинами статті */
export interface DividerBlock {
  id: string;
  type: "divider";
}

/** Кнопка-заклик (реєстрація, пожертва, детальніше) */
export interface ButtonBlock {
  id: string;
  type: "button";
  text: string;
  href: string;
  external?: boolean;
}

export type ArticleBlock =
  | LeadBlock
  | TextBlock
  | HeadingBlock
  | QuoteBlock
  | VerseBlock
  | ImageBlock
  | GalleryBlock
  | ListBlock
  | VideoBlock
  | CalloutBlock
  | DividerBlock
  | ButtonBlock;

export type BlockType = ArticleBlock["type"];

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
  dateLabel: string;
  readTime: string;
  author: Author;
  cover: ImageData;
  blocks: ArticleBlock[];
}
