import { z } from "zod";
import { fromDateKey, mondayIndex, toDateKey } from "./calendarUtils";

/**
 * Розклад подій: правила повторення, винятки, «що відбувається в цей день».
 * Спільне для сайту (календар), адмінки (редактор, перегляд місяця) і сервера.
 * Дати — рядки "YYYY-MM-DD" за місцевим (київським) календарем.
 */

export type EventRepeat = "WEEKLY" | "MONTHLY" | "ONCE";
export type EventFormat = "OFFLINE" | "ONLINE" | "HYBRID";

export const FORMAT_LABEL: Record<EventFormat, string> = {
  OFFLINE: "Офлайн",
  ONLINE: "Онлайн",
  HYBRID: "Офлайн + онлайн",
};

export interface EventRule {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
  repeat: EventRepeat;
  /** 0 — понеділок … 6 — неділя */
  weekdays: number[];
  /** MONTHLY: 1–4 або -1 (останній) */
  monthWeek: number | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string;
  endTime: string | null;
  format: EventFormat | null;
  place: string;
  address: string;
  linkUrl: string;
  linkLabel: string;
  showInFooter: boolean;
  published: boolean;
}

export interface EventExceptionData {
  date: string;
  cancelled: boolean;
  startTime: string | null;
  place: string | null;
  note: string;
}

export type EventWithExceptions = EventRule & { exceptions: EventExceptionData[] };

/** Одна подія в конкретний день (з урахуванням винятку) */
export interface Occurrence {
  event: EventRule;
  date: string;
  startTime: string;
  endTime: string | null;
  place: string;
  cancelled: boolean;
  /** Час чи місце змінено винятком */
  changed: boolean;
  note: string;
}

// ---------- Перевірка даних (редактор і сервер) ----------

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Час у форматі 19:00");
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата у форматі РРРР-ММ-ДД");

export const eventExceptionSchema = z.object({
  date: dateKey,
  cancelled: z.boolean(),
  startTime: time.nullable(),
  place: z.string().trim().max(100).nullable(),
  note: z.string().trim().max(200),
});

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(1, "Вкажіть назву").max(120),
    shortTitle: z.string().trim().max(40),
    description: z.string().trim().max(1500),
    image: z.string().trim().max(500),
    repeat: z.enum(["WEEKLY", "MONTHLY", "ONCE"]),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
    monthWeek: z.number().int().min(-1).max(4).nullable(),
    startDate: dateKey.nullable(),
    endDate: dateKey.nullable(),
    startTime: time,
    endTime: time.nullable(),
    format: z.enum(["OFFLINE", "ONLINE", "HYBRID"]).nullable(),
    place: z.string().trim().max(100),
    address: z.string().trim().max(200),
    linkUrl: z.union([z.literal(""), z.string().trim().url("Посилання має починатися з https://").max(500)]),
    linkLabel: z.string().trim().max(40),
    showInFooter: z.boolean(),
    published: z.boolean(),
    exceptions: z.array(eventExceptionSchema).max(200),
  })
  .superRefine((e, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (e.repeat === "WEEKLY" && e.weekdays.length === 0) issue("weekdays", "Виберіть хоча б один день тижня");
    if (e.repeat === "MONTHLY") {
      if (e.weekdays.length !== 1) issue("weekdays", "Виберіть день тижня");
      if (e.monthWeek === null || e.monthWeek === 0) issue("monthWeek", "Виберіть, котрий за рахунком");
    }
    if (e.repeat === "ONCE" && !e.startDate) issue("startDate", "Вкажіть дату");
    if (e.startDate && e.endDate && e.endDate < e.startDate) issue("endDate", "Кінець раніше за початок");
    if (e.endTime && e.endTime <= e.startTime) issue("endTime", "Кінець раніше за початок");
  });

export type EventInput = z.infer<typeof eventInputSchema>;

// ---------- Коли відбувається ----------

const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/** Чи припадає подія (за правилом, без винятків) на цей день */
export const occursOn = (rule: EventRule, date: Date): boolean => {
  const key = toDateKey(date);
  if (rule.repeat === "ONCE") {
    if (!rule.startDate) return false;
    return key >= rule.startDate && key <= (rule.endDate ?? rule.startDate);
  }
  if (rule.startDate && key < rule.startDate) return false;
  if (rule.endDate && key > rule.endDate) return false;

  const weekday = mondayIndex(date);
  if (rule.repeat === "WEEKLY") return rule.weekdays.includes(weekday);

  // MONTHLY: N-й / останній такий день тижня в місяці
  if (rule.weekdays[0] !== weekday || !rule.monthWeek) return false;
  if (rule.monthWeek === -1) return date.getDate() + 7 > daysInMonth(date);
  return Math.ceil(date.getDate() / 7) === rule.monthWeek;
};

/** Усі події дня з урахуванням винятків, за часом */
export const getOccurrences = (events: EventWithExceptions[], date: Date): Occurrence[] => {
  const key = toDateKey(date);
  return events
    .filter((e) => e.published && occursOn(e, date))
    .map((e) => {
      const ex = e.exceptions.find((x) => x.date === key);
      const startTime = ex?.startTime || e.startTime;
      const place = ex?.place || e.place;
      return {
        event: e,
        date: key,
        startTime,
        // Перенесли початок — кінець без змін не показуємо (він став би неправдою)
        endTime: ex?.startTime ? null : e.endTime,
        place,
        cancelled: !!ex?.cancelled,
        changed: !!ex && !ex.cancelled && (!!ex.startTime || !!ex.place),
        note: ex?.note ?? "",
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

/** Найближчий день, де є хоч одна НЕ скасована подія (шукаємо до ~року вперед) */
export const findNextEventDate = (events: EventWithExceptions[], from: Date, maxDays = 400) => {
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    if (getOccurrences(events, date).some((o) => !o.cancelled)) return toDateKey(date);
  }
  return null;
};

/** Найближчі дати однієї події (для перевірки в редакторі) */
export const nextDates = (event: EventWithExceptions, from: Date, count = 6, maxDays = 800) => {
  const result: Occurrence[] = [];
  for (let i = 0; i < maxDays && result.length < count; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const occ = getOccurrences([{ ...event, published: true }], date)[0];
    if (occ) result.push(occ);
  }
  return result;
};

// ---------- Опис людською мовою ----------

export const WEEKDAY_ADVERB = ["щопонеділка", "щовівторка", "щосереди", "щочетверга", "щопʼятниці", "щосуботи", "щонеділі"];
export const WEEKDAY_SHORT_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const WEEKDAY_NOM = ["понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота", "неділя"];
const NTH = { 1: "1-й", 2: "2-й", 3: "3-й", 4: "4-й", [-1]: "останній" } as Record<number, string>;
const NTH_FEM = { 1: "1-а", 2: "2-а", 3: "3-я", 4: "4-а", [-1]: "остання" } as Record<number, string>;
const FEMININE = new Set([2, 4, 5, 6]); // середа, пʼятниця, субота, неділя

const MONTHS_GEN = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
export const formatDateKey = (key: string, withYear = true) => {
  const d = fromDateKey(key);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ""}`;
};

const timeRange = (e: Pick<EventRule, "startTime" | "endTime">) => (e.endTime ? `${e.startTime}–${e.endTime}` : e.startTime);

/** «Щонеділі о 10:00», «Пн, Ср о 19:00», «Щомісяця: 1-а неділя о 17:00», «24 грудня 2026 о 18:00» */
export const describeSchedule = (e: EventRule) => {
  const at = `о ${timeRange(e)}`;
  if (e.repeat === "ONCE") {
    if (!e.startDate) return "Дата не вказана";
    if (e.endDate && e.endDate !== e.startDate) return `${formatDateKey(e.startDate)} – ${formatDateKey(e.endDate)}, ${at}`;
    return `${formatDateKey(e.startDate)} ${at}`;
  }
  let base: string;
  if (e.repeat === "MONTHLY") {
    const wd = e.weekdays[0] ?? 6;
    const nth = (FEMININE.has(wd) ? NTH_FEM : NTH)[e.monthWeek ?? 1] ?? "";
    base = `Щомісяця: ${nth} ${WEEKDAY_NOM[wd]} ${at}`;
  } else {
    const days = [...e.weekdays].sort((a, b) => a - b);
    base =
      days.length === 1
        ? `${WEEKDAY_ADVERB[days[0]].charAt(0).toUpperCase()}${WEEKDAY_ADVERB[days[0]].slice(1)} ${at}`
        : days.length === 7
          ? `Щодня ${at}`
          : `${days.map((d) => WEEKDAY_SHORT_NAMES[d]).join(", ")} ${at}`;
  }
  const period =
    e.startDate && e.endDate
      ? ` · з ${formatDateKey(e.startDate, false)} до ${formatDateKey(e.endDate)}`
      : e.startDate
        ? ` · з ${formatDateKey(e.startDate)}`
        : e.endDate
          ? ` · до ${formatDateKey(e.endDate)}`
          : "";
  return base + period;
};

/** Посилання «Прокласти маршрут»: своя адреса події або адреса церкви */
export const routeUrl = (address: string, churchAddress: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || churchAddress)}`;

// ---------- Налаштування блоку ----------

export interface EventsSettings {
  rubric: string;
  title: string;
  titleAccent: string;
  text: string;
  monthsPast: number;
  monthsFuture: number;
  footerTitle: string;
}

export const DEFAULT_EVENTS_SETTINGS: EventsSettings = {
  rubric: "Час разом",
  title: "Графік",
  titleAccent: "подій та зустрічей",
  text: "Перегляньте, щоб не пропустити час спільної молитви, богослужінь і теплих зустрічей з церквою",
  monthsPast: 1,
  monthsFuture: 12,
  footerTitle: "Розклад служінь",
};

export const eventsSettingsSchema = z.object({
  rubric: z.string().trim().max(40),
  title: z.string().trim().min(1, "Заголовок порожній").max(80),
  titleAccent: z.string().trim().max(80),
  text: z.string().trim().max(300),
  monthsPast: z.number().int().min(0).max(12),
  monthsFuture: z.number().int().min(1).max(24),
  footerTitle: z.string().trim().min(1).max(60),
});
