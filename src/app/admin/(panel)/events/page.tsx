import type { Metadata } from "next";
import Link from "next/link";
import { listAdminEvents } from "@/server/admin/events";
import { createEvent, duplicateEvent, setEventPublished } from "@/server/admin/event-actions";
import { describeSchedule, FORMAT_LABEL } from "@/features/events-calendar/schedule";
import { getToday, toDateKey } from "@/features/events-calendar/calendarUtils";
import { CALENDAR_TIME_ZONE } from "@/features/events-calendar/events";
import { variantOf } from "@/features/media/urls";
import { revalidatePath } from "next/cache";
import { Icon } from "../icons";
import AdminEventsCalendar from "./AdminEventsCalendar";
import "../articles/articles.scss";
import "./events.scss";

export const metadata: Metadata = { title: "Події" };

type AdminEvent = Awaited<ReturnType<typeof listAdminEvents>>[number];

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view === "calendar" ? "calendar" : "list";
  const events = await listAdminEvents();
  const todayKey = toDateKey(getToday(CALENDAR_TIME_ZONE));

  // Церковний тиждень — з неділі (6) далі понеділок (0)…
  const churchDay = (e: AdminEvent) => Math.min(...e.weekdays.map((d) => (d + 1) % 7));
  const isPastOnce = (e: AdminEvent) => e.repeat === "ONCE" && (e.endDate ?? e.startDate ?? "") < todayKey;
  const groups: { title: string; hint?: string; items: AdminEvent[] }[] = [
    {
      title: "Щотижневі",
      // Як у розкладі: від неділі, далі за часом
      items: events
        .filter((e) => e.published && e.repeat === "WEEKLY")
        .sort((a, b) => churchDay(a) - churchDay(b) || a.startTime.localeCompare(b.startTime)),
    },
    { title: "Щомісячні", items: events.filter((e) => e.published && e.repeat === "MONTHLY") },
    {
      title: "Разові — майбутні",
      items: events
        .filter((e) => e.published && e.repeat === "ONCE" && !isPastOnce(e))
        .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? "")),
    },
    { title: "Приховані з сайту", hint: "Не показуються в календарі й розкладі", items: events.filter((e) => !e.published) },
    {
      title: "Минулі разові",
      items: events.filter((e) => e.published && isPastOnce(e)).sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")),
    },
  ].filter((g) => g.items.length > 0);

  // Показати / сховати прямо зі списку
  async function togglePublished(formData: FormData) {
    "use server";
    await setEventPublished(String(formData.get("id")), formData.get("published") === "1");
    revalidatePath("/admin/events");
  }

  return (
    <>
      <header className="a-page-head">
        <div>
          <h1 className="a-page-head__title">Події</h1>
          <p className="ev-intro">Календар «Графік подій» на головній і розклад у футері складаються з цих подій.</p>
        </div>
        <div className="ev-head-actions">
          <Link className="a-btn a-btn--ghost" href="/admin/events/settings">
            <Icon name="settings" />
            Налаштування блоку
          </Link>
          <form action={createEvent}>
            <button type="submit" className="a-btn a-btn--primary">
              <Icon name="plus" />
              Нова подія
            </button>
          </form>
        </div>
      </header>

      <div className="ev-toolbar">
        <div className="articles__tabs" role="tablist" aria-label="Вигляд">
          <Link className={`articles__tab ${view === "list" ? "articles__tab--active" : ""}`.trim()} href="/admin/events">
            <Icon name="viewList" /> Список
          </Link>
          <Link
            className={`articles__tab ${view === "calendar" ? "articles__tab--active" : ""}`.trim()}
            href="/admin/events?view=calendar"
          >
            <Icon name="calendar" /> Календар
          </Link>
        </div>
        <span className="ev-count">Усього подій: {events.length}</span>
      </div>

      {view === "calendar" ? (
        <AdminEventsCalendar events={events} />
      ) : events.length === 0 ? (
        <div className="articles__empty">Подій поки немає.</div>
      ) : (
        groups.map((g) => (
          <section key={g.title} className="articles__group">
            <h2 className="articles__group-title">
              {g.title} <span className="ev-group-count">{g.items.length}</span>
              {g.hint && <span className="ev-group-hint"> · {g.hint}</span>}
            </h2>
            <ul className="ev-list">
              {g.items.map((e) => (
                <li key={e.id} className={`ev-row ${e.published ? "" : "is-hidden"}`.trim()}>
                  <span className="ev-row__img">
                    {e.image ? <img src={variantOf(e.image, 480)} alt="" loading="lazy" /> : <Icon name="calendar" />}
                  </span>
                  <div className="ev-row__main">
                    <Link className="ev-row__title" href={`/admin/events/${e.id}`}>
                      {e.title}
                    </Link>
                    <p className="ev-row__when">{describeSchedule(e)}</p>
                    <p className="ev-row__meta">
                      {e.format && <span>{FORMAT_LABEL[e.format]}</span>}
                      {e.place && <span>{e.place}</span>}
                      {e.showInFooter && <span className="ev-tag">у розкладі у футері</span>}
                      {e.exceptions.filter((x) => x.date >= todayKey).length > 0 && (
                        <span className="ev-tag ev-tag--warn">
                          винятків: {e.exceptions.filter((x) => x.date >= todayKey).length}
                        </span>
                      )}
                      {e.linkUrl && <span className="ev-tag">{e.linkLabel || "посилання"}</span>}
                    </p>
                  </div>
                  <div className="ev-row__actions">
                    <form action={togglePublished}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="published" value={e.published ? "0" : "1"} />
                      <button type="submit" className="ev-icon-btn" title={e.published ? "Сховати з сайту" : "Показати на сайті"}>
                        <Icon name={e.published ? "eye" : "eyeOff"} />
                      </button>
                    </form>
                    <form action={duplicateEvent.bind(null, e.id)}>
                      <button type="submit" className="ev-icon-btn" title="Дублювати">
                        <Icon name="copy" />
                      </button>
                    </form>
                    <Link className="ev-icon-btn" href={`/admin/events/${e.id}`} title="Редагувати">
                      <Icon name="edit" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
