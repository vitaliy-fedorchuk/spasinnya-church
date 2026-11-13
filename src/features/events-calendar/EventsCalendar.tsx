"use client";

import { useMemo, useState } from "react";
import "./EventsCalendar.scss";
import { ROUTE_URL } from "../../constants";
import {
  addMonths,
  fromDateKey,
  getMonthCells,
  getToday,
  mondayIndex,
  startOfMonth,
  toDateKey,
} from "./calendarUtils";
import {
  CALENDAR_TIME_ZONE,
  MONTHS_FUTURE,
  MONTHS_PAST,
  MONTH_NAMES,
  MONTH_NAMES_GENITIVE,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  findNextEventDate,
  getEventsForDate,
} from "./events";
import arrowIconAsset from "../../assets/events/arrow-next.svg";
import calendarIconAsset from "../../assets/events/calendar.svg";
import clockIconAsset from "../../assets/events/clock.svg";
import globeIconAsset from "../../assets/events/globe.svg";
import roomIconAsset from "../../assets/events/room.svg";
import linkArrowIconAsset from "../../assets/events/link-arrow.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const arrowIcon = arrowIconAsset.src;
const calendarIcon = calendarIconAsset.src;
const clockIcon = clockIconAsset.src;
const globeIcon = globeIconAsset.src;
const roomIcon = roomIconAsset.src;
const linkArrowIcon = linkArrowIconAsset.src;


const formatFullDate = (date: Date) =>
  `${date.getDate()} ${MONTH_NAMES_GENITIVE[date.getMonth()]}, ${WEEKDAY_NAMES[mondayIndex(date)].toLowerCase()}`;

const EventsCalendar = () => {
  const today = useMemo(() => getToday(CALENDAR_TIME_ZONE), []);
  const todayKey = toDateKey(today);

  // Початково — найближчий день з подіями (сьогодні, якщо подія є сьогодні)
  const [selectedKey, setSelectedKey] = useState(() => findNextEventDate(today));
  const [month, setMonth] = useState(() =>
    startOfMonth(selectedKey ? fromDateKey(selectedKey) : today),
  );

  const minMonth = addMonths(today, -MONTHS_PAST);
  const maxMonth = addMonths(today, MONTHS_FUTURE);
  const canGoPrev = addMonths(month, -1) >= minMonth;
  const canGoNext = addMonths(month, 1) <= maxMonth;

  const cells = useMemo(() => getMonthCells(month), [month]);

  const selectedDate = selectedKey ? fromDateKey(selectedKey) : null;
  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="events-calendar" data-surface="dark">
      {/* ---------- Календар ---------- */}
      <div className="events-calendar__calendar">
        <div className="events-calendar__header">
          <button
            type="button"
            className="events-calendar__arrow"
            aria-label="Попередній місяць"
            disabled={!canGoPrev}
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <img className="events-calendar__arrow-icon events-calendar__arrow-icon--flipped" src={arrowIcon} alt="" />
          </button>
          <h3 className="events-calendar__month" aria-live="polite">
            {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
          </h3>
          <button
            type="button"
            className="events-calendar__arrow"
            aria-label="Наступний місяць"
            disabled={!canGoNext}
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <img className="events-calendar__arrow-icon" src={arrowIcon} alt="" />
          </button>
        </div>

        <div className="events-calendar__weekdays" aria-hidden="true">
          {WEEKDAY_SHORT.map((day, i) => (
            <span key={i} className="events-calendar__weekday">
              {day}
            </span>
          ))}
        </div>

        <div className="events-calendar__grid">
          {cells.map((date, i) => {
            if (!date) return <span key={i} className="events-calendar__tile events-calendar__tile--empty" />;

            const key = toDateKey(date);
            const count = getEventsForDate(date).length;
            const isSelected = key === selectedKey;
            const status = isSelected ? "selected" : count ? "event" : "no-event";

            return (
              <button
                key={key}
                type="button"
                className={`events-calendar__tile events-calendar__tile--${status}${
                  key === todayKey ? " events-calendar__tile--today" : ""
                }`}
                disabled={!count}
                aria-pressed={isSelected}
                aria-label={`${formatFullDate(date)}${count ? `, подій: ${count}` : ""}${
                  key === todayKey ? ", сьогодні" : ""
                }`}
                onClick={() => setSelectedKey(key)}
              >
                <span className="events-calendar__day">{date.getDate()}</span>
                {/* Кілька подій у день — маленький кружечок з кількістю */}
                {count > 1 && (
                  <span className="events-calendar__count" aria-hidden="true">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="events-calendar__legend">
          <span className="events-calendar__legend-item">
            <span className="events-calendar__legend-dot events-calendar__legend-dot--selected" />
            Вибрана дата
          </span>
          <span className="events-calendar__legend-item">
            <span className="events-calendar__legend-dot" />
            Подія
          </span>
        </div>
      </div>

      {/* ---------- Події вибраного дня ---------- */}
      <div className="events-calendar__panel" aria-live="polite">
        {/* key — при зміні дня список з'являється заново і прокрутка скидається вгору */}
        <div key={selectedKey ?? "none"} className="events-calendar__panel-scroll">
          {selectedDate && dayEvents.length ? (
            <>
              {dayEvents.length > 1 && (
                <p className="events-calendar__day-note">
                  {formatFullDate(selectedDate)} · подій: {dayEvents.length}
                </p>
              )}
              {dayEvents.map((event) => (
                <article key={event.id} className="events-calendar__event">
                  <h3 className="events-calendar__event-title">{event.title}</h3>
                  <img className="events-calendar__event-img" src={event.image} alt="" loading="lazy" />
                  <p className="events-calendar__event-text">{event.description}</p>

                  <ul className="events-calendar__chips">
                    <li className="events-calendar__chip">
                      <img src={calendarIcon} alt="" />
                      {WEEKDAY_NAMES[mondayIndex(selectedDate)]}
                    </li>
                    <li className="events-calendar__chip">
                      <img src={clockIcon} alt="" />
                      {event.time}
                    </li>
                    {event.format && (
                      <li className="events-calendar__chip">
                        <img src={globeIcon} alt="" />
                        {event.format}
                      </li>
                    )}
                    {event.place && (
                      <li className="events-calendar__chip">
                        <img src={roomIcon} alt="" />
                        {event.place}
                      </li>
                    )}
                    <li>
                      <a
                        className="events-calendar__route"
                        href={ROUTE_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Прокласти маршрут"
                      >
                        <img src={linkArrowIcon} alt="" />
                      </a>
                    </li>
                  </ul>
                </article>
              ))}
            </>
          ) : (
            <p className="events-calendar__empty">Оберіть день із подією в календарі</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsCalendar;
