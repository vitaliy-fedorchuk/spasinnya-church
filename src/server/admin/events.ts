import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { eventInclude, toEventData } from "../events";

/** Усі події (і приховані) для адмінки */
export const listAdminEvents = async () => {
  await requireUser();
  const rows = await db.event.findMany({ include: eventInclude, orderBy: [{ startTime: "asc" }, { title: "asc" }] });
  return rows.map((r) => ({ ...toEventData(r), updatedAt: r.updatedAt.toISOString() }));
};

export const getAdminEvent = async (id: string) => {
  await requireUser();
  const row = await db.event.findUnique({ where: { id }, include: eventInclude });
  return row ? toEventData(row) : null;
};

/** Місця, що вже трапляються — підказки в редакторі */
export const listEventPlaces = async () => {
  await requireUser();
  const rows = await db.event.findMany({ where: { place: { not: "" } }, select: { place: true }, distinct: ["place"] });
  return rows.map((r) => r.place);
};
