"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addMonths, getMonthCells, getToday, startOfMonth, toDateKey } from "@/features/events-calendar/calendarUtils";
import { CALENDAR_TIME_ZONE, MONTH_NAMES } from "@/features/events-calendar/events";
import { getOccurrences, type EventWithExceptions } from "@/features/events-calendar/schedule";
import { Icon } from "../icons";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

/**
 * Огляд місяця для адмінки: усі події по днях, з винятками.
 * Приховані події показуються блідо (на сайті їх немає).
 */
const AdminEventsCalendar = ({ events }: { events: EventWithExceptions[] }) => {
  const today = useMemo(() => getToday(CALENDAR_TIME_ZONE), []);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const todayKey = toDateKey(today);
  const cells = useMemo(() => getMonthCells(month), [month]);
  // Показуємо і приховані — позначаємо їх окремо
  const all = useMemo(() => events.map((e) => ({ ...e, published: true })), [events]);
  const hidden = new Set(events.filter((e) => !e.published).map((e) => e.id));

  return (
    <div className="ev-cal">
      <div className="ev-cal__head">
        <button type="button" className="ev-icon-btn" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Попередній місяць">
          <Icon name="back" />
        </button>
        <h2 className="ev-cal__month">
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </h2>
        <button
          type="button"
          className="ev-icon-btn ev-icon-btn--flip"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Наступний місяць"
        >
          <Icon name="back" />
        </button>
        <button type="button" className="ed-link-btn" onClick={() => setMonth(startOfMonth(today))}>
          Сьогодні
        </button>
      </div>

      <div className="ev-cal__grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="ev-cal__wd">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} className="ev-cal__cell ev-cal__cell--empty" />;
          const key = toDateKey(date);
          const occ = getOccurrences(all, date);
          return (
            <div key={key} className={`ev-cal__cell ${key === todayKey ? "is-today" : ""} ${key < todayKey ? "is-past" : ""}`.trim()}>
              <span className="ev-cal__day">{date.getDate()}</span>
              <ul>
                {occ.map((o) => (
                  <li key={o.event.id}>
                    <Link
                      href={`/admin/events/${o.event.id}`}
                      className={`ev-cal__item ${o.cancelled ? "is-cancelled" : ""} ${o.changed ? "is-changed" : ""} ${
                        hidden.has(o.event.id) ? "is-hidden" : ""
                      }`.trim()}
                      title={`${o.event.title}${o.cancelled ? " — скасовано" : o.changed ? " — змінено" : ""}${o.note ? `: ${o.note}` : ""}`}
                    >
                      <b>{o.startTime}</b> {o.event.shortTitle || o.event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="ev-cal__legend">
        <span className="ev-cal__item">Звичайна</span>
        <span className="ev-cal__item is-changed">Змінено час / місце</span>
        <span className="ev-cal__item is-cancelled">Скасовано</span>
        <span className="ev-cal__item is-hidden">Прихована з сайту</span>
      </p>
    </div>
  );
};

export default AdminEventsCalendar;
