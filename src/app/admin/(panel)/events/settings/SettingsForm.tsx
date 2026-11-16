"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_EVENTS_SETTINGS, type EventsSettings } from "@/features/events-calendar/schedule";
import { saveEventsSettings } from "@/server/admin/event-actions";
import { Icon } from "../../icons";
import { Field, Textarea, TextInput } from "../../articles/[id]/fields";

const SettingsForm = ({ initial }: { initial: EventsSettings }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const patch = (p: Partial<EventsSettings>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
    setMessage(null);
  };

  const save = () =>
    startTransition(async () => {
      const res = await saveEventsSettings(form);
      if (res.ok) {
        setDirty(false);
        setMessage({ text: "Збережено" });
        router.refresh();
      } else setMessage({ text: res.error, error: true });
    });

  return (
    <div>
      <div className="ed-bar">
        <Link href="/admin/events" className="ed-bar__back">
          <Icon name="back" />
          Події
        </Link>
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
          <section className="ed-card">
            <h2 className="ed-card__title">Заголовок секції на головній</h2>
            <TextInput label="Мітка над заголовком" value={form.rubric} maxLength={40} onChange={(rubric) => patch({ rubric })} />
            <div className="ed-row">
              <TextInput label="Заголовок" value={form.title} maxLength={80} onChange={(title) => patch({ title })} />
              <TextInput
                label="Виділена частина (коричнева)"
                value={form.titleAccent}
                maxLength={80}
                onChange={(titleAccent) => patch({ titleAccent })}
              />
            </div>
            <Textarea label="Текст під заголовком" value={form.text} rows={3} onChange={(text) => patch({ text: text.slice(0, 300) })} />

            {/* Як виглядатиме — спрощено, у кольорах сайту */}
            <div className="ev-settings-preview">
              {form.rubric && <span className="ev-settings-preview__rubric">{form.rubric}</span>}
              <p className="ev-settings-preview__title">
                {form.title} {form.titleAccent && <span>{form.titleAccent}</span>}
              </p>
              {form.text && <p className="ev-settings-preview__text">{form.text}</p>}
            </div>
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Календар</h2>
            <div className="ed-row">
              <Field label="Можна гортати назад, місяців" hint="0 — лише поточний і майбутні">
                <input
                  type="number"
                  className="ed-input"
                  min={0}
                  max={12}
                  value={form.monthsPast}
                  onChange={(e) => patch({ monthsPast: Math.max(0, Math.min(12, Number(e.target.value) || 0)) })}
                />
              </Field>
              <Field label="Можна гортати вперед, місяців" hint="Скільки наперед бачать відвідувачі">
                <input
                  type="number"
                  className="ed-input"
                  min={1}
                  max={24}
                  value={form.monthsFuture}
                  onChange={(e) => patch({ monthsFuture: Math.max(1, Math.min(24, Number(e.target.value) || 1)) })}
                />
              </Field>
            </div>
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Футер</h2>
            <TextInput
              label="Заголовок розкладу"
              value={form.footerTitle}
              maxLength={60}
              hint="У розклад потрапляють щотижневі події з позначкою «У розкладі у футері»"
              onChange={(footerTitle) => patch({ footerTitle })}
            />
          </section>

          <button type="button" className="ed-link-btn" onClick={() => patch(DEFAULT_EVENTS_SETTINGS)}>
            Повернути початкові тексти
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
