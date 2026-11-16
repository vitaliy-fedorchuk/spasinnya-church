"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  describeSchedule,
  eventInputSchema,
  formatDateKey,
  FORMAT_LABEL,
  nextDates,
  occursOn,
  WEEKDAY_SHORT_NAMES,
  type EventExceptionData,
  type EventFormat,
  type EventInput,
  type EventRepeat,
  type EventWithExceptions,
} from "@/features/events-calendar/schedule";
import { fromDateKey, getToday, mondayIndex, toDateKey } from "@/features/events-calendar/calendarUtils";
import { CALENDAR_TIME_ZONE, WEEKDAY_NAMES } from "@/features/events-calendar/events";
import { deleteEvent, duplicateEvent, saveEvent } from "@/server/admin/event-actions";
import { Icon } from "../../icons";
import { Checkbox, Field, ImageInput, Textarea, TextInput } from "../../articles/[id]/fields";

const REPEATS: { value: EventRepeat; label: string; hint: string }[] = [
  { value: "WEEKLY", label: "Щотижня", hint: "У вибрані дні тижня" },
  { value: "MONTHLY", label: "Щомісяця", hint: "Напр., 1-а неділя місяця" },
  { value: "ONCE", label: "Один раз", hint: "Дата або кілька днів поспіль" },
];

const MONTH_WEEKS = [
  { value: 1, label: "1-й / 1-а" },
  { value: 2, label: "2-й / 2-а" },
  { value: 3, label: "3-й / 3-я" },
  { value: 4, label: "4-й / 4-а" },
  { value: -1, label: "Останній / остання" },
];

const toInput = (e: EventWithExceptions): EventInput => ({
  title: e.title,
  shortTitle: e.shortTitle,
  description: e.description,
  image: e.image,
  repeat: e.repeat,
  weekdays: e.weekdays,
  monthWeek: e.monthWeek,
  startDate: e.startDate,
  endDate: e.endDate,
  startTime: e.startTime,
  endTime: e.endTime,
  format: e.format,
  place: e.place,
  address: e.address,
  linkUrl: e.linkUrl,
  linkLabel: e.linkLabel,
  showInFooter: e.showInFooter,
  published: e.published,
  exceptions: e.exceptions,
});

const EMPTY_EXCEPTION = { date: "", cancelled: true, startTime: "", place: "", note: "" };

const EventForm = ({ event, places }: { event: EventWithExceptions; places: string[] }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<EventInput>(() => toInput(event));
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean; field?: string } | null>(null);
  const [exDraft, setExDraft] = useState(EMPTY_EXCEPTION);
  const [exError, setExError] = useState<string | null>(null);
  const today = useMemo(() => getToday(CALENDAR_TIME_ZONE), []);

  const patch = (p: Partial<EventInput>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
    setMessage(null);
  };

  // Попередження, якщо йдуть зі сторінки з незбереженим
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  // Подія як «правило» — для опису й найближчих дат (живий перегляд)
  const rule: EventWithExceptions = {
    ...event,
    ...form,
    exceptions: form.exceptions.map((x) => ({ ...x })),
  };
  const upcoming = nextDates(rule, today, 8);
  const futureExceptions = form.exceptions
    .filter((x) => x.date >= toDateKey(today))
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastExceptions = form.exceptions.length - futureExceptions.length;

  const save = () => {
    const parsed = eventInputSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setMessage({ text: first.message, error: true, field: String(first.path[0] ?? "") });
      return;
    }
    startTransition(async () => {
      const res = await saveEvent(event.id, form);
      if (res.ok) {
        setDirty(false);
        setMessage({ text: "Збережено" });
        router.refresh();
      } else setMessage({ text: res.error, error: true, field: res.field });
    });
  };

  const fieldError = (name: string) => (message?.error && message.field === name ? message.text : undefined);

  const toggleWeekday = (d: number) => {
    if (form.repeat === "MONTHLY") return patch({ weekdays: [d] });
    patch({ weekdays: form.weekdays.includes(d) ? form.weekdays.filter((x) => x !== d) : [...form.weekdays, d].sort() });
  };

  const setException = (ex: EventExceptionData) =>
    patch({ exceptions: [...form.exceptions.filter((x) => x.date !== ex.date), ex].sort((a, b) => a.date.localeCompare(b.date)) });

  const addException = () => {
    if (!exDraft.date) return setExError("Виберіть дату");
    if (!occursOn(rule, fromDateKey(exDraft.date))) return setExError("У цей день подія за розкладом не відбувається");
    if (!exDraft.cancelled && !exDraft.startTime && !exDraft.place) return setExError("Вкажіть новий час або місце");
    setException({
      date: exDraft.date,
      cancelled: exDraft.cancelled,
      startTime: exDraft.cancelled ? null : exDraft.startTime || null,
      place: exDraft.cancelled ? null : exDraft.place || null,
      note: exDraft.note,
    });
    setExDraft(EMPTY_EXCEPTION);
    setExError(null);
  };

  const isRecurring = form.repeat !== "ONCE";

  return (
    <div className="ev-edit">
      <div className="ed-bar">
        <Link href="/admin/events" className="ed-bar__back">
          <Icon name="back" />
          Події
        </Link>
        <span className={`a-badge a-badge--${form.published ? "published" : "draft"}`}>
          {form.published ? "Показується на сайті" : "Прихована"}
        </span>
        <span className={`ed-bar__save ed-bar__save--${message?.error ? "error" : dirty ? "dirty" : "saved"}`}>
          {message?.text ?? (dirty ? "Є незбережені зміни" : "Усе збережено")}
        </span>
        <div className="ed-bar__actions">
          <a className="a-btn a-btn--ghost" href="/#events" target="_blank" rel="noreferrer">
            <Icon name="eye" />
            На сайті
          </a>
          <button type="button" className="a-btn a-btn--primary" onClick={save} disabled={pending || !dirty}>
            <Icon name="save" />
            Зберегти
          </button>
        </div>
      </div>

      <div className="ed-layout">
        <div className="ev-edit__main">
          {/* ---------- Що ---------- */}
          <section className="ed-card">
            <h2 className="ed-card__title">Подія</h2>
            <TextInput
              label="Назва"
              value={form.title}
              maxLength={120}
              error={fieldError("title")}
              onChange={(title) => patch({ title })}
            />
            <TextInput
              label="Коротка назва (для розкладу у футері)"
              value={form.shortTitle}
              maxLength={40}
              placeholder={form.title}
              hint="Напр., «Молодіжка». Порожньо — повна назва"
              onChange={(shortTitle) => patch({ shortTitle })}
            />
            <Textarea
              label="Опис"
              value={form.description}
              rows={4}
              hint={`${form.description.length}/1500`}
              onChange={(description) => patch({ description: description.slice(0, 1500) })}
            />
            <ImageInput label="Фото" src={form.image} alt="" hideAlt onChange={({ src }) => patch({ image: src })} />
          </section>

          {/* ---------- Коли ---------- */}
          <section className="ed-card">
            <h2 className="ed-card__title">Коли</h2>

            <div className="ev-repeat" role="radiogroup" aria-label="Повторення">
              {REPEATS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={form.repeat === r.value}
                  className={`ev-repeat__btn ${form.repeat === r.value ? "is-active" : ""}`.trim()}
                  onClick={() =>
                    patch({
                      repeat: r.value,
                      weekdays: r.value === "MONTHLY" ? form.weekdays.slice(0, 1) : form.weekdays,
                      monthWeek: r.value === "MONTHLY" ? (form.monthWeek ?? 1) : null,
                    })
                  }
                >
                  <b>{r.label}</b>
                  <span>{r.hint}</span>
                </button>
              ))}
            </div>

            {isRecurring && (
              <Field label={form.repeat === "MONTHLY" ? "День тижня" : "Дні тижня"} error={fieldError("weekdays")}>
                <div className="ev-weekdays">
                  {WEEKDAY_SHORT_NAMES.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={form.weekdays.includes(i)}
                      className={`ev-weekdays__btn ${form.weekdays.includes(i) ? "is-on" : ""}`.trim()}
                      onClick={() => toggleWeekday(i)}
                      title={WEEKDAY_NAMES[i]}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {form.repeat === "MONTHLY" && (
              <Field label="Котрий за рахунком у місяці" error={fieldError("monthWeek")}>
                <select
                  className="ed-input"
                  value={form.monthWeek ?? 1}
                  onChange={(e) => patch({ monthWeek: Number(e.target.value) })}
                >
                  {MONTH_WEEKS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="ed-row">
              <Field
                label={form.repeat === "ONCE" ? "Дата" : "Діє з (необовʼязково)"}
                error={fieldError("startDate")}
                hint={form.repeat === "ONCE" ? undefined : "Напр., початок навчального року"}
              >
                <input
                  type="date"
                  className="ed-input"
                  value={form.startDate ?? ""}
                  onChange={(e) => patch({ startDate: e.target.value || null })}
                />
              </Field>
              <Field
                label={form.repeat === "ONCE" ? "До (для кількох днів)" : "Діє до (необовʼязково)"}
                error={fieldError("endDate")}
              >
                <input
                  type="date"
                  className="ed-input"
                  value={form.endDate ?? ""}
                  min={form.startDate ?? undefined}
                  onChange={(e) => patch({ endDate: e.target.value || null })}
                />
              </Field>
            </div>

            <div className="ed-row">
              <Field label="Початок" error={fieldError("startTime")}>
                <input type="time" className="ed-input" value={form.startTime} onChange={(e) => patch({ startTime: e.target.value })} />
              </Field>
              <Field label="Кінець (необовʼязково)" error={fieldError("endTime")}>
                <input
                  type="time"
                  className="ed-input"
                  value={form.endTime ?? ""}
                  onChange={(e) => patch({ endTime: e.target.value || null })}
                />
              </Field>
            </div>

            <p className="ev-summary">
              <Icon name="calendar" /> {describeSchedule(rule)}
            </p>
          </section>

          {/* ---------- Де ---------- */}
          <section className="ed-card">
            <h2 className="ed-card__title">Де і як</h2>
            <Field label="Формат">
              <div className="ev-segment">
                {([null, "OFFLINE", "ONLINE", "HYBRID"] as (EventFormat | null)[]).map((f) => (
                  <button
                    key={f ?? "none"}
                    type="button"
                    aria-pressed={form.format === f}
                    className={`ev-segment__btn ${form.format === f ? "is-on" : ""}`.trim()}
                    onClick={() => patch({ format: f })}
                  >
                    {f ? FORMAT_LABEL[f] : "Не вказувати"}
                  </button>
                ))}
              </div>
            </Field>
            <div className="ed-row">
              <Field label="Місце в церкві" hint="Напр., «Молодіжна кімната»">
                <input
                  className="ed-input"
                  list="event-places"
                  value={form.place}
                  maxLength={100}
                  onChange={(e) => patch({ place: e.target.value })}
                />
                <datalist id="event-places">
                  {places.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </Field>
              <TextInput
                label="Інша адреса (виїзні події)"
                value={form.address}
                maxLength={200}
                placeholder="Порожньо — адреса церкви"
                hint={form.format === "ONLINE" ? "Для онлайн-подій кнопка маршруту не показується" : "Для кнопки «Прокласти маршрут»"}
                onChange={(address) => patch({ address })}
              />
            </div>
            <div className="ed-row">
              <TextInput
                label="Посилання (трансляція, реєстрація)"
                value={form.linkUrl}
                placeholder="https://…"
                error={fieldError("linkUrl")}
                onChange={(linkUrl) => patch({ linkUrl })}
              />
              <TextInput
                label="Текст кнопки"
                value={form.linkLabel}
                maxLength={40}
                placeholder="Трансляція / Реєстрація"
                onChange={(linkLabel) => patch({ linkLabel })}
              />
            </div>
          </section>

          {/* ---------- Винятки ---------- */}
          {isRecurring && (
            <section className="ed-card">
              <h2 className="ed-card__title">Винятки</h2>
              <p className="ed-muted">
                Скасувати конкретний день або змінити в цей день час чи місце. На сайті така дата позначиться
                «Скасовано» / «Змінено» з вашою приміткою.
              </p>

              {futureExceptions.length > 0 ? (
                <ul className="ev-exceptions">
                  {futureExceptions.map((x) => (
                    <li key={x.date} className={`ev-exc ${x.cancelled ? "is-cancelled" : "is-changed"}`}>
                      <span className="ev-exc__date">
                        {formatDateKey(x.date)}, {WEEKDAY_NAMES[mondayIndex(fromDateKey(x.date))].toLowerCase()}
                      </span>
                      <span className="ev-exc__what">
                        {x.cancelled
                          ? "Скасовано"
                          : ["Змінено", x.startTime && `о ${x.startTime}`, x.place && `· ${x.place}`].filter(Boolean).join(" ")}
                        {x.note && <i> — {x.note}</i>}
                      </span>
                      <button
                        type="button"
                        className="ev-icon-btn"
                        title="Прибрати виняток"
                        onClick={() => patch({ exceptions: form.exceptions.filter((e) => e.date !== x.date) })}
                      >
                        <Icon name="trash" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ed-muted">Найближчим часом винятків немає.</p>
              )}
              {pastExceptions > 0 && <p className="ed-muted">Минулих винятків: {pastExceptions} (на сайті вже не видно)</p>}

              <div className="ev-exc-form">
                <div className="ed-row">
                  <Field label="Дата">
                    <input
                      type="date"
                      className="ed-input"
                      value={exDraft.date}
                      min={toDateKey(today)}
                      onChange={(e) => setExDraft({ ...exDraft, date: e.target.value })}
                    />
                  </Field>
                  <Field label="Що з цим днем">
                    <div className="ev-segment">
                      <button
                        type="button"
                        className={`ev-segment__btn ${exDraft.cancelled ? "is-on" : ""}`.trim()}
                        onClick={() => setExDraft({ ...exDraft, cancelled: true })}
                      >
                        Скасувати
                      </button>
                      <button
                        type="button"
                        className={`ev-segment__btn ${!exDraft.cancelled ? "is-on" : ""}`.trim()}
                        onClick={() => setExDraft({ ...exDraft, cancelled: false })}
                      >
                        Змінити час / місце
                      </button>
                    </div>
                  </Field>
                </div>
                {!exDraft.cancelled && (
                  <div className="ed-row">
                    <Field label="Новий час">
                      <input
                        type="time"
                        className="ed-input"
                        value={exDraft.startTime}
                        onChange={(e) => setExDraft({ ...exDraft, startTime: e.target.value })}
                      />
                    </Field>
                    <Field label="Нове місце">
                      <input
                        className="ed-input"
                        list="event-places"
                        value={exDraft.place}
                        maxLength={100}
                        onChange={(e) => setExDraft({ ...exDraft, place: e.target.value })}
                      />
                    </Field>
                  </div>
                )}
                <TextInput
                  label="Примітка для відвідувачів"
                  value={exDraft.note}
                  maxLength={200}
                  placeholder="Напр., «Спільне служіння з іншою церквою»"
                  onChange={(note) => setExDraft({ ...exDraft, note })}
                />
                {exError && <p className="ed-field__error">{exError}</p>}
                <button type="button" className="a-btn a-btn--ghost" onClick={addException}>
                  <Icon name="plus" />
                  Додати виняток
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ---------- Бічна панель ---------- */}
        <aside className="ed-side">
          <section className="ed-card">
            <h2 className="ed-card__title">Показ</h2>
            <Checkbox label="Показувати на сайті" checked={form.published} onChange={(published) => patch({ published })} />
            {form.repeat === "WEEKLY" && (
              <Checkbox
                label="У розкладі у футері"
                checked={form.showInFooter}
                onChange={(showInFooter) => patch({ showInFooter })}
              />
            )}
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Найближчі дати</h2>
            {upcoming.length === 0 ? (
              <p className="ed-muted">За цим розкладом найближчим часом дат немає.</p>
            ) : (
              <ul className="ev-upcoming">
                {upcoming.map((o) => (
                  <li key={o.date} className={o.cancelled ? "is-cancelled" : o.changed ? "is-changed" : ""}>
                    <span>
                      <b>{formatDateKey(o.date, false)}</b>, {WEEKDAY_NAMES[mondayIndex(fromDateKey(o.date))].toLowerCase()} ·{" "}
                      {o.startTime}
                      {o.cancelled && " · скасовано"}
                      {o.changed && " · змінено"}
                    </span>
                    {isRecurring && !o.cancelled && !o.changed && (
                      <button
                        type="button"
                        className="ed-link-btn ed-link-btn--danger"
                        title="Скасувати цей день"
                        onClick={() => setException({ date: o.date, cancelled: true, startTime: null, place: null, note: "" })}
                      >
                        скасувати
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ed-card">
            <form action={duplicateEvent.bind(null, event.id)}>
              <button type="submit" className="ed-link-btn">
                <Icon name="copy" />
                Дублювати подію
              </button>
            </form>
            <form
              action={deleteEvent.bind(null, event.id)}
              onSubmit={(e) => {
                if (!window.confirm(`Видалити подію «${form.title}» назавжди?`)) e.preventDefault();
              }}
            >
              <button type="submit" className="ed-link-btn ed-link-btn--danger">
                <Icon name="trash" />
                Видалити подію
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EventForm;
