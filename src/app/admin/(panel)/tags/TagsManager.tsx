"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TagRow } from "@/server/admin/tags";
import { deleteTag, mergeTags, renameTag, type TagResult } from "@/server/admin/tag-actions";
import { Icon } from "../icons";

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "стаття" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "статті" : "статей");

const TagsManager = ({ tags }: { tags: TagRow[] }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<{ tag: string; value: string } | null>(null);
  const [mergeTarget, setMergeTarget] = useState("");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? tags.filter((t) => t.tag.toLowerCase().includes(s)) : tags;
  }, [tags, q]);

  // Схожі теги (однакові без урахування регістру) — підказка, що їх варто обʼєднати
  const lookalikes = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const t of tags) {
      const key = t.tag.toLowerCase().replace(/\s+/g, " ");
      groups.set(key, [...(groups.get(key) ?? []), t.tag]);
    }
    return [...groups.values()].filter((g) => g.length > 1);
  }, [tags]);

  const run = (action: () => Promise<TagResult>, done: string) =>
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        setMessage({ text: `${done} Змінено статей: ${res.changed}.` });
        setSelected([]);
        setEditing(null);
        setMergeTarget("");
        router.refresh();
      } else setMessage({ text: res.error, error: true });
    });

  const toggle = (tag: string) =>
    setSelected((list) => (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]));

  // За замовчуванням обʼєднуємо в найпопулярніший із вибраних
  const defaultTarget = tags.filter((t) => selected.includes(t.tag)).sort((a, b) => b.articles - a.articles)[0]?.tag ?? "";

  return (
    <div className="tags">
      {lookalikes.length > 0 && (
        <div className="tags__hint">
          <Icon name="callout" />
          <span>
            Схожі теги: {lookalikes.map((g) => g.join(" / ")).join("; ")}. Виберіть їх і натисніть «Обʼєднати».
          </span>
        </div>
      )}

      <div className="tags__toolbar">
        <label className="articles__search">
          <Icon name="search" />
          <span className="visually-hidden">Пошук тегу</span>
          <input className="a-input" type="search" placeholder="Пошук тегу…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="tags__count">Усього тегів: {tags.length}</span>
      </div>

      {message && <p className={`tags__msg ${message.error ? "is-error" : ""}`.trim()}>{message.text}</p>}

      {selected.length >= 2 && (
        <div className="tags__merge">
          <span>
            Вибрано {selected.length}: <b>{selected.join(", ")}</b>
          </span>
          <span className="tags__merge-form">
            Обʼєднати в
            <input
              className="a-input"
              list="tags-all"
              value={mergeTarget || defaultTarget}
              onChange={(e) => setMergeTarget(e.target.value)}
              aria-label="Назва обʼєднаного тегу"
            />
            <button
              type="button"
              className="a-btn a-btn--primary"
              disabled={pending}
              onClick={() => run(() => mergeTags(selected, mergeTarget || defaultTarget), "Теги обʼєднано.")}
            >
              Обʼєднати
            </button>
            <button type="button" className="ed-link-btn" onClick={() => setSelected([])}>
              Скасувати
            </button>
          </span>
        </div>
      )}

      <datalist id="tags-all">
        {tags.map((t) => (
          <option key={t.tag} value={t.tag} />
        ))}
      </datalist>

      {visible.length === 0 ? (
        <div className="articles__empty">{tags.length ? "Нічого не знайдено." : "Тегів поки немає — вони зʼявляться, коли додасте їх у статтях."}</div>
      ) : (
        <ul className="tags__list">
          {visible.map((t) => (
            <li key={t.tag} className={`tags__row ${selected.includes(t.tag) ? "is-selected" : ""}`.trim()}>
              <input
                type="checkbox"
                className="tags__check"
                checked={selected.includes(t.tag)}
                onChange={() => toggle(t.tag)}
                aria-label={`Вибрати тег ${t.tag}`}
              />

              {editing?.tag === t.tag ? (
                <form
                  className="tags__rename"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => renameTag(t.tag, editing.value), "Тег перейменовано.");
                  }}
                >
                  <input
                    className="a-input"
                    value={editing.value}
                    list="tags-all"
                    autoFocus
                    maxLength={40}
                    onChange={(e) => setEditing({ tag: t.tag, value: e.target.value })}
                    onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                    aria-label="Нова назва тегу"
                  />
                  <button type="submit" className="a-btn a-btn--primary" disabled={pending}>
                    <Icon name="save" />
                    Зберегти
                  </button>
                  <button type="button" className="ed-link-btn" onClick={() => setEditing(null)}>
                    Скасувати
                  </button>
                </form>
              ) : (
                <span className="tags__name">{t.tag}</span>
              )}

              <Link className="tags__usage" href={`/admin/articles?tag=${encodeURIComponent(t.tag)}`}>
                {t.articles} {plural(t.articles)}
                {t.published !== t.articles && <span> · опубл. {t.published}</span>}
              </Link>

              {editing?.tag !== t.tag && (
                <span className="tags__actions">
                  <button type="button" title="Перейменувати" onClick={() => setEditing({ tag: t.tag, value: t.tag })}>
                    <Icon name="edit" />
                  </button>
                  <button
                    type="button"
                    title="Видалити тег"
                    className="tags__delete"
                    onClick={() => {
                      if (window.confirm(`Прибрати тег «${t.tag}» з усіх статей (${t.articles})? Самі статті лишаються.`))
                        run(() => deleteTag(t.tag), "Тег видалено.");
                    }}
                  >
                    <Icon name="trash" />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagsManager;
