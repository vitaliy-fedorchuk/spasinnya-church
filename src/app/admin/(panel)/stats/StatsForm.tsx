"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ChurchStats } from "@/features/church-stats/stats";
import { saveChurchStats } from "@/server/admin/stats-actions";
import { Icon } from "../icons";
import { Field, TextInput } from "../articles/[id]/fields";

type CountKey = Exclude<keyof ChurchStats, "asOf">;

const COUNTS: { key: CountKey; label: string; hint: string }[] = [
  { key: "members", label: "Членів церкви", hint: "Головна (блок «Про нас») і сторінка «Історія церкви»" },
  { key: "children", label: "Дітей", hint: "3–11 років · «Історія церкви»" },
  { key: "teens", label: "Підлітків", hint: "12–16 років · «Історія церкви»" },
  { key: "youth", label: "Молоді", hint: "16–30 років · «Історія церкви»" },
  { key: "pastors", label: "Пасторів", hint: "Сторінка «Історія церкви»" },
  { key: "deacons", label: "Дияконів", hint: "Сторінка «Історія церкви»" },
];

const StatsForm = ({ initial }: { initial: ChurchStats }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const patch = (p: Partial<ChurchStats>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
    setMessage(null);
  };

  const save = () =>
    startTransition(async () => {
      const res = await saveChurchStats(form);
      if (res.ok) {
        setDirty(false);
        setMessage({ text: "Збережено" });
        router.refresh();
      } else setMessage({ text: res.error, error: true });
    });

  return (
    <div>
      <div className="ed-bar">
        <span className="ed-bar__back">Цифри</span>
        <span className={`ed-bar__save ed-bar__save--${message?.error ? "error" : dirty ? "dirty" : "saved"}`}>
          {message?.text ?? (dirty ? "Є незбережені зміни" : "Усе збережено")}
        </span>
        <div className="ed-bar__actions">
          <a className="a-btn a-btn--ghost" href="/istoriya#sogodni" target="_blank" rel="noreferrer">
            <Icon name="eye" />
            На сайті
          </a>
          <button type="button" className="a-btn a-btn--primary" onClick={save} disabled={pending || !dirty}>
            <Icon name="save" />
            Зберегти
          </button>
        </div>
      </div>

      {/* На всю ширину — без бічної колонки редактора */}
      <div className="stats-page">
        <div>
          <section className="ed-card">
            <h2 className="ed-card__title">Числа</h2>
            <p className="stats-intro">Одне місце для чисел церкви — на сайті вони беруться звідси.</p>
            <div className="stats-grid">
              {COUNTS.map((c) => (
                <Field key={c.key} label={c.label} hint={c.hint}>
                  <input
                    type="number"
                    className="ed-input"
                    min={0}
                    max={100000}
                    value={form[c.key]}
                    onChange={(e) => patch({ [c.key]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                  />
                </Field>
              ))}
            </div>
            <TextInput
              label="Станом на"
              value={form.asOf}
              maxLength={40}
              placeholder="листопад 2026"
              hint="Підпис біля чисел на сторінці «Історія церкви». Порожньо — без підпису"
              onChange={(asOf) => patch({ asOf })}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default StatsForm;
