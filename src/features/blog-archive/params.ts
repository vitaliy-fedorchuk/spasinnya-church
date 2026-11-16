/**
 * Фільтри «Часопису» живуть в адресі (/blog?tag=Молодь&month=2025-12),
 * тож будь-яким станом сторінки можна поділитися посиланням.
 * Вигляд (список / картки) — не в адресі, а в cookie: це звичка читача.
 */

export const PAGE_SIZE = 12;
export const VIEW_COOKIE = "blog_view";
export type ArchiveView = "list" | "grid";

export interface ArchiveParams {
  q?: string;
  tag?: string;
  /** id автора */
  author?: string;
  /** «2025-12» */
  month?: string;
  /** Рік, відкритий у календарі (коли місяць не обрано) */
  year?: number;
  /** Скільки статей показано у стрічці («Старіші новини» додає ще) */
  n?: number;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const str = (v: string | string[] | undefined) => {
  const s = (Array.isArray(v) ? v[0] : v)?.trim();
  return s ? s.slice(0, 100) : undefined;
};

export const parseArchiveParams = (sp: Record<string, string | string[] | undefined>): ArchiveParams => {
  const month = str(sp.month);
  const year = Number(str(sp.year));
  const n = Number(str(sp.n));
  return {
    q: str(sp.q),
    tag: str(sp.tag),
    author: str(sp.author),
    month: month && MONTH_RE.test(month) ? month : undefined,
    year: Number.isInteger(year) && year > 1990 && year < 3000 ? year : undefined,
    n: Number.isInteger(n) && n > PAGE_SIZE ? Math.min(n, 1000) : undefined,
  };
};

/**
 * Адреса з частково зміненими фільтрами. Будь-яка зміна фільтра скидає
 * «показано N» — нова вибірка починається з першої сторінки.
 */
export const archiveHref = (current: ArchiveParams, patch: Partial<ArchiveParams>, hash = "") => {
  const next: ArchiveParams = { ...current, n: undefined, ...patch };
  const qs = new URLSearchParams();
  if (next.q) qs.set("q", next.q);
  if (next.tag) qs.set("tag", next.tag);
  if (next.author) qs.set("author", next.author);
  if (next.month) qs.set("month", next.month);
  else if (next.year) qs.set("year", String(next.year));
  if (next.n) qs.set("n", String(next.n));
  const s = qs.toString();
  return `/blog${s ? `?${s}` : ""}${hash}`;
};

export const MONTHS = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];
export const MONTHS_SHORT = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
/** Родовий відмінок — для дати в картці: «12 січня» */
export const MONTHS_GENITIVE = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

/** «2025-12» → «Грудень 2025» */
export const monthTitle = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

/** Українська множина: plural(3, ["стаття", "статті", "статей"]) → «статті» */
export const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
};

/** 1 стаття, 3 статті, 5 статей */
export const articlesWord = (n: number) => `${n} ${plural(n, ["стаття", "статті", "статей"])}`;
