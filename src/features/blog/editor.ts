import { z } from "zod";
import { articleBlockSchema, type ArticleBlock, type BlockType } from "./types";

/**
 * Спільне для редактора (браузер) і серверних дій: дані статті в редакторі,
 * нові блоки, адреса з назви, перевірка перед публікацією.
 */

// ---------- Адреса з назви (офіційна транслітерація КМУ 2010) ----------

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z",
  и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ь: "", ю: "iu", я: "ia", "'": "", "’": "", "ʼ": "",
};
// На початку слова деякі літери пишуться інакше
const TRANSLIT_START: Record<string, string> = { є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya" };

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/зг/g, "zgh") // «Згорани» → Zghorany (виняток із правил)
    .replace(/(^|[^а-яґєії'’ʼ])([єїйюя])/g, (_, before: string, ch: string) => before + TRANSLIT_START[ch])
    .replace(/[а-яґєіїʼ'’]/g, (ch) => TRANSLIT[ch] ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

// ---------- Нові блоки ----------

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Порожній блок потрібного типу — з усіма полями, щоб форми були керованими */
export const createBlock = (type: BlockType): ArticleBlock => {
  const id = newId();
  switch (type) {
    case "lead":
      return { id, type, text: "" };
    case "text":
      return { id, type, paragraphs: [""] };
    case "heading":
      return { id, type, level: 2, text: "" };
    case "quote":
      return { id, type, text: "", author: "", role: "" };
    case "verse":
      return { id, type, text: "", reference: "" };
    case "image":
      return { id, type, image: { src: "", alt: "" }, caption: "", wide: false };
    case "gallery":
      return { id, type, images: [{ src: "", alt: "" }, { src: "", alt: "" }], caption: "" };
    case "list":
      return { id, type, ordered: false, items: [""] };
    case "video":
      return { id, type, youtubeId: "", poster: "", title: "", caption: "" };
    case "callout":
      return { id, type, title: "", text: "" };
    case "divider":
      return { id, type };
    case "button":
      return { id, type, text: "", href: "", external: false };
  }
};

/**
 * Блок із бази → блок для редактора: необовʼязкові поля, яких немає
 * (їх прибирає cleanBlock при публікації), заповнюємо порожніми значеннями —
 * щоб поля форми завжди були керованими.
 */
export const normalizeBlock = (block: ArticleBlock): ArticleBlock =>
  ({ ...createBlock(block.type), ...block }) as ArticleBlock;

/** Копія блоку з новим id (кнопка «Дублювати») */
export const duplicateBlock = (block: ArticleBlock): ArticleBlock => ({
  ...structuredClone(block),
  id: newId(),
});

// ---------- Дані статті в редакторі ----------

export const BLOCK_TYPES = articleBlockSchema.options.map((o) => o.shape.type.value) as BlockType[];

/**
 * Чернетка може бути недописаною (порожній абзац, фото без адреси) —
 * тут перевіряємо лише структуру. Повна перевірка — publishIssues().
 */
export const draftBlockSchema = z.looseObject({
  id: z.string().min(1),
  type: z.enum(BLOCK_TYPES as [BlockType, ...BlockType[]]),
});

export const editorArticleSchema = z.object({
  title: z.string().max(200),
  slug: z.string().max(80),
  authorId: z.string().min(1),
  tags: z.array(z.string().trim().min(1).max(40)).max(10),
  coverSrc: z.string().max(500),
  coverAlt: z.string().max(300),
  /** ISO-дата або null (= «зараз» при публікації) */
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(300),
  blocks: z.array(draftBlockSchema).max(300),
});

export type EditorArticle = Omit<z.infer<typeof editorArticleSchema>, "blocks"> & { blocks: ArticleBlock[] };

// ---------- Перевірка перед публікацією ----------

export interface EditorIssue {
  /** Блок, до якого помилка; без нього — поле статті (field) */
  blockId?: string;
  field?: string;
  message: string;
}

const FIELD_LABEL: Record<string, string> = {
  text: "Текст",
  paragraphs: "Текст",
  items: "Пункти списку",
  reference: "Посилання на вірш",
  title: "Назва",
  src: "Адреса фото",
  image: "Фото",
  images: "Фото",
  youtubeId: "Відео",
  href: "Посилання",
};

const issueMessage = (issue: z.core.$ZodIssue) => {
  const key = [...issue.path].reverse().find((p) => typeof p === "string" && p in FIELD_LABEL) as string | undefined;
  const label = key ? FIELD_LABEL[key] : "Поле";
  if (key === "images" && (issue.code === "too_small" || issue.code === "too_big")) return "Галерея: потрібно від 2 до 4 фото";
  if (issue.code === "invalid_format" || (issue.code === "custom" && issue.message)) return issue.message;
  return `Заповніть «${label}»`;
};

/** Усе, що заважає опублікувати статтю. Порожній масив — можна публікувати. */
export const publishIssues = (a: EditorArticle): EditorIssue[] => {
  const issues: EditorIssue[] = [];
  if (!a.title.trim()) issues.push({ field: "title", message: "Додайте назву статті" });
  if (!SLUG_PATTERN.test(a.slug))
    issues.push({ field: "slug", message: "Адреса: лише малі латинські літери, цифри й дефіси" });
  if (!a.coverSrc.trim()) issues.push({ field: "coverSrc", message: "Додайте обкладинку" });
  if (a.blocks.length === 0) issues.push({ field: "blocks", message: "Додайте хоча б один блок" });

  for (const block of a.blocks) {
    const result = articleBlockSchema.safeParse(cleanBlock(block));
    if (!result.success) {
      // Одна помилка на блок — найперша, щоб не засипати повідомленнями
      issues.push({ blockId: block.id, message: issueMessage(result.error.issues[0]) });
    }
  }
  return issues;
};

/**
 * Перед публікацією прибираємо порожнє: необовʼязкові поля (підпис "", автор цитати "")
 * і порожні абзаци / пункти списку — щоб у базі лежали чисті дані,
 * а сайт не малював порожніх підписів.
 */
export const cleanBlock = (block: ArticleBlock): ArticleBlock =>
  JSON.parse(
    JSON.stringify(block, (k, v) => {
      if (Array.isArray(v)) return v.filter((x) => !(typeof x === "string" && x.trim() === ""));
      // alt лишаємо: порожній alt — свідоме «фото декоративне», і поле обовʼязкове
      if (k !== "alt" && typeof v === "string" && v.trim() === "") return undefined;
      return v;
    }),
  );
