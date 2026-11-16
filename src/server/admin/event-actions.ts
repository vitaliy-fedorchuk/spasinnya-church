"use server";

import { redirect } from "next/navigation";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { keyToDate, saveEventsSettingsRow } from "../events";
import { eventInputSchema, eventsSettingsSchema, type EventInput, type EventsSettings } from "@/features/events-calendar/schedule";

export type EventSaveResult = { ok: true } | { ok: false; error: string; field?: string };

/** «Нова подія»: чернетка (прихована з сайту) → одразу в редактор */
export async function createEvent() {
  await requireUser();
  const event = await db.event.create({
    data: { title: "Нова подія", repeat: "WEEKLY", weekdays: [6], startTime: "10:00", published: false },
  });
  redirect(`/admin/events/${event.id}`);
}

const toData = (e: EventInput) => ({
  title: e.title,
  shortTitle: e.shortTitle,
  description: e.description,
  image: e.image,
  repeat: e.repeat,
  // Для MONTHLY — один день; для ONCE дні тижня не потрібні
  weekdays: e.repeat === "ONCE" ? [] : e.repeat === "MONTHLY" ? e.weekdays.slice(0, 1) : [...new Set(e.weekdays)].sort(),
  monthWeek: e.repeat === "MONTHLY" ? e.monthWeek : null,
  startDate: keyToDate(e.startDate),
  endDate: keyToDate(e.endDate),
  startTime: e.startTime,
  endTime: e.endTime,
  format: e.format,
  place: e.place,
  address: e.address,
  linkUrl: e.linkUrl,
  linkLabel: e.linkLabel,
  // У футері — лише щотижневі
  showInFooter: e.repeat === "WEEKLY" && e.showInFooter,
  published: e.published,
});

/** Зберегти подію разом із винятками (винятки замінюються повністю) */
export async function saveEvent(id: string, input: unknown): Promise<EventSaveResult> {
  await requireUser();
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Перевірте поля", field: String(first?.path[0] ?? "") };
  }
  const e = parsed.data;
  const exceptions = e.repeat === "ONCE" ? [] : e.exceptions;
  const unique = new Map(exceptions.map((x) => [x.date, x]));

  await db.$transaction([
    db.event.update({ where: { id }, data: toData(e) }),
    db.eventException.deleteMany({ where: { eventId: id } }),
    db.eventException.createMany({
      data: [...unique.values()].map((x) => ({
        eventId: id,
        date: keyToDate(x.date)!,
        cancelled: x.cancelled,
        startTime: x.cancelled ? null : x.startTime,
        place: x.cancelled ? null : x.place || null,
        note: x.note,
      })),
    }),
  ]);
  return { ok: true };
}

/** Копія події (прихована) — зручно для схожих зустрічей */
export async function duplicateEvent(id: string) {
  await requireUser();
  const src = await db.event.findUnique({ where: { id } });
  if (!src) redirect("/admin/events");
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
  void _id;
  void _c;
  void _u;
  const copy = await db.event.create({ data: { ...rest, title: `${src.title} (копія)`, published: false } });
  redirect(`/admin/events/${copy.id}`);
}

export async function deleteEvent(id: string) {
  await requireUser();
  await db.event.delete({ where: { id } }).catch(() => {});
  redirect("/admin/events");
}

/** Швидко показати / сховати з сайту (зі списку) */
export async function setEventPublished(id: string, published: boolean) {
  await requireUser();
  await db.event.update({ where: { id }, data: { published } });
}

export async function saveEventsSettings(input: EventsSettings): Promise<EventSaveResult> {
  await requireUser();
  const parsed = eventsSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Перевірте поля" };
  await saveEventsSettingsRow(parsed.data);
  return { ok: true };
}
