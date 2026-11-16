import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { Prisma } from "../generated/prisma/client";
import {
  DEFAULT_EVENTS_SETTINGS,
  eventsSettingsSchema,
  type EventsSettings,
  type EventWithExceptions,
} from "@/features/events-calendar/schedule";

const EVENTS_SETTINGS_KEY = "events";

// Дати в базі — тип DATE (опівніч UTC); у коді — рядки "YYYY-MM-DD"
export const dateToKey = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
export const keyToDate = (k: string | null) => (k ? new Date(`${k}T00:00:00Z`) : null);

export const eventInclude = { exceptions: { orderBy: { date: "asc" } } } satisfies Prisma.EventInclude;
type EventRow = Prisma.EventGetPayload<{ include: typeof eventInclude }>;

export const toEventData = (e: EventRow): EventWithExceptions => ({
  id: e.id,
  title: e.title,
  shortTitle: e.shortTitle,
  description: e.description,
  image: e.image,
  repeat: e.repeat,
  weekdays: e.weekdays,
  monthWeek: e.monthWeek,
  startDate: dateToKey(e.startDate),
  endDate: dateToKey(e.endDate),
  startTime: e.startTime,
  endTime: e.endTime,
  format: e.format,
  place: e.place,
  address: e.address,
  linkUrl: e.linkUrl,
  linkLabel: e.linkLabel,
  showInFooter: e.showInFooter,
  published: e.published,
  exceptions: e.exceptions.map((x) => ({
    date: dateToKey(x.date)!,
    cancelled: x.cancelled,
    startTime: x.startTime,
    place: x.place,
    note: x.note,
  })),
});

/** Опубліковані події для календаря на сайті. cache() — футер і секція беруть з одного запиту. */
export const getSiteEvents = cache(async () => {
  const rows = await db.event.findMany({ where: { published: true }, include: eventInclude, orderBy: { startTime: "asc" } });
  return rows.map(toEventData);
});

/** Налаштування блоку подій (з типовими значеннями, якщо ще не зберігали) */
export const getEventsSettings = cache(async (): Promise<EventsSettings> => {
  const row = await db.siteSetting.findUnique({ where: { key: EVENTS_SETTINGS_KEY } });
  const parsed = eventsSettingsSchema.partial().safeParse(row?.value ?? {});
  return { ...DEFAULT_EVENTS_SETTINGS, ...(parsed.success ? parsed.data : {}) };
});

export const saveEventsSettingsRow = (value: EventsSettings) =>
  db.siteSetting.upsert({
    where: { key: EVENTS_SETTINGS_KEY },
    update: { value: value as unknown as Prisma.InputJsonValue },
    create: { key: EVENTS_SETTINGS_KEY, value: value as unknown as Prisma.InputJsonValue },
  });

const WEEKDAY_NAMES = ["Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота", "Неділя"];
// Церковний тиждень у розкладі починається з неділі
const FOOTER_ORDER = [6, 0, 1, 2, 3, 4, 5];

/** Рядки розкладу у футері: щотижневі події з позначкою «у футері», від неділі */
export const getFooterSchedule = async () => {
  const events = await getSiteEvents();
  return events
    .filter((e) => e.showInFooter && e.repeat === "WEEKLY")
    .flatMap((e) => e.weekdays.map((wd) => ({ wd, time: e.startTime, label: e.shortTitle || e.title, id: `${e.id}-${wd}` })))
    .sort((a, b) => FOOTER_ORDER.indexOf(a.wd) - FOOTER_ORDER.indexOf(b.wd) || a.time.localeCompare(b.time))
    .map((x) => ({ id: x.id, day: `${WEEKDAY_NAMES[x.wd]} - ${x.label}`, time: x.time }));
};

/**
 * Розклад тижня по днях (сторінка «Я тут вперше»): ті самі події, що у футері,
 * згруповані за днем — «Неділя: 10:00 Ранкове, 17:00 Вечірнє».
 */
export const getWeeklySchedule = async () => {
  const events = await getSiteEvents();
  const rows = events
    .filter((e) => e.showInFooter && e.repeat === "WEEKLY")
    .flatMap((e) => e.weekdays.map((wd) => ({ wd, time: e.startTime, label: e.shortTitle || e.title })));
  return FOOTER_ORDER.map((wd) => ({
    day: WEEKDAY_NAMES[wd],
    items: rows
      .filter((r) => r.wd === wd)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(({ time, label }) => ({ time, label })),
  })).filter((d) => d.items.length > 0);
};
