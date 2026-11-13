"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ArticleBlock, BlockType } from "@/features/blog/types";
import {
  createBlock,
  duplicateBlock,
  normalizeBlock,
  slugify,
  type EditorArticle,
  type EditorIssue,
} from "@/features/blog/editor";
import {
  deleteArticle,
  publishArticle,
  saveArticle,
  unpublishArticle,
  type SaveResult,
} from "@/server/admin/article-actions";
import type { HistoryEntry } from "@/server/admin/history";
import { Icon } from "../../icons";
import BlockList from "./BlockList";
import { Field, ImageInput, Textarea, TextInput } from "./fields";

type Status = "DRAFT" | "PUBLISHED";
type SaveState = "saved" | "dirty" | "saving" | "error";

interface Props {
  id: string;
  initialStatus: Status;
  initialArticle: EditorArticle;
  initialHistory: HistoryEntry[];
  authors: { id: string; name: string; role: string }[];
}

const AUTOSAVE_MS = 1500;

// datetime-local працює з місцевим часом без зони: «2026-01-12T12:00»
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Усе збережено",
  dirty: "Є незбережені зміни",
  saving: "Зберігаємо…",
  error: "Не вдалося зберегти",
};

const ACTION_LABEL: Record<HistoryEntry["action"], string> = {
  CREATED: "створив(-ла)",
  EDITED: "редагував(-ла)",
  PUBLISHED: "опублікував(-ла)",
  UNPUBLISHED: "зняв(-ла) з публікації",
};

const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );

const ArticleEditor = ({ id, initialStatus, initialArticle, initialHistory, authors }: Props) => {
  const [article, setArticle] = useState<EditorArticle>(() => ({
    ...initialArticle,
    blocks: initialArticle.blocks.map(normalizeBlock),
  }));
  const [status, setStatus] = useState<Status>(initialStatus);
  const [history, setHistory] = useState(initialHistory);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [issues, setIssues] = useState<EditorIssue[]>([]);
  const [busy, setBusy] = useState(false);
  // Адреса йде за назвою, доки її не змінили вручну (і доки стаття не опублікована)
  const [slugLocked, setSlugLocked] = useState(
    () => initialStatus === "PUBLISHED" || !initialArticle.slug.startsWith("chernetka-"),
  );
  const [tagDraft, setTagDraft] = useState("");
  // «Зараз» для «заплановано / опубліковано»: оновлюється після кожного збереження
  const [now, setNow] = useState(() => Date.now());

  // Свіжі дані для збереження з таймера / Ctrl+S
  const articleRef = useRef(article);
  const versionRef = useRef(0);
  const savingRef = useRef<Promise<SaveResult | null> | null>(null);
  useEffect(() => {
    articleRef.current = article;
  }, [article]);

  // ---------- Зміни ----------

  const clearIssues = (pred: (i: EditorIssue) => boolean) =>
    setIssues((list) => (list.some(pred) ? list.filter((i) => !pred(i)) : list));

  const patch = useCallback((p: Partial<EditorArticle>) => {
    versionRef.current++;
    setArticle((a) => ({ ...a, ...p }));
    setSaveState("dirty");
    clearIssues((i) => !i.blockId && !!i.field && i.field in p);
  }, []);

  const setBlocks = (fn: (blocks: ArticleBlock[]) => ArticleBlock[]) => {
    versionRef.current++;
    setArticle((a) => ({ ...a, blocks: fn(a.blocks) }));
    setSaveState("dirty");
    clearIssues((i) => i.field === "blocks");
  };

  // Адреса йде за назвою; поки назва порожня — лишається тимчасова
  const onTitle = (title: string) =>
    patch(slugLocked || !slugify(title) ? { title } : { title, slug: slugify(title) });

  const onBlockChange = (block: ArticleBlock) => {
    setBlocks((list) => list.map((b) => (b.id === block.id ? block : b)));
    clearIssues((i) => i.blockId === block.id);
  };

  const onInsert = (index: number, type: BlockType) => {
    const block = createBlock(type);
    setBlocks((list) => [...list.slice(0, index), block, ...list.slice(index)]);
    // Прокрутити до нового блоку й поставити курсор у перше поле
    requestAnimationFrame(() => {
      const el = document.getElementById(`block-${block.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("textarea, input, select")?.focus({ preventScroll: true });
    });
  };

  const onMove = (from: number, to: number) =>
    setBlocks((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const onDuplicate = (index: number) =>
    setBlocks((list) => [...list.slice(0, index + 1), duplicateBlock(list[index]), ...list.slice(index + 1)]);

  const onRemove = (index: number) => setBlocks((list) => list.filter((_, i) => i !== index));

  // ---------- Збереження ----------

  const applyResult = useCallback((res: SaveResult, version: number) => {
    if (res.ok) {
      setNow(Date.now());
      setStatus(res.status);
      setHistory(res.history);
      setIssues([]);
      // Поки зберігали, могли щось змінити — тоді лишаємось «dirty»
      setSaveState(versionRef.current === version ? "saved" : "dirty");
      setArticle((a) => (a.publishedAt === res.publishedAt ? a : { ...a, publishedAt: res.publishedAt }));
    } else {
      setIssues(res.issues);
      setSaveState("error");
      requestAnimationFrame(() => {
        const first = res.issues[0];
        const el = first?.blockId
          ? document.getElementById(`block-${first.blockId}`)
          : document.querySelector(".ed-issues");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    return res;
  }, []);

  const run = useCallback(async (action: (a: EditorArticle) => Promise<SaveResult>) => {
    // Не запускаємо два збереження одночасно
    while (savingRef.current) await savingRef.current;
    const version = versionRef.current;
    setSaveState("saving");
    const promise = action(articleRef.current).catch(() => null);
    savingRef.current = promise;
    const res = await promise;
    savingRef.current = null;
    if (!res) {
      setSaveState("error");
      setIssues([{ message: "Немає звʼязку з сервером. Зміни не збережено — спробуйте ще раз." }]);
      return null;
    }
    return applyResult(res, version);
  }, [applyResult]);

  const save = useCallback(() => run((a) => saveArticle(id, a)), [id, run]);

  // Автозбереження — лише для чернеток: опублікована стаття змінюється
  // на сайті тільки після «Оновити»
  useEffect(() => {
    if (status !== "DRAFT" || saveState !== "dirty") return;
    const t = setTimeout(save, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [article, status, saveState, save]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Попередження, якщо закривають сторінку з незбереженим
  useEffect(() => {
    if (saveState === "saved") return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [saveState]);

  const withBusy = async <T,>(fn: () => Promise<T>) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  };

  const onPublish = () => withBusy(() => run((a) => publishArticle(id, a)));
  const onUnpublish = () => {
    if (!window.confirm("Зняти статтю з публікації? Вона зникне з сайту й стане чернеткою.")) return;
    // Незбережені зміни лишаються — чернетка збережеться автоматично
    return withBusy(() => run(() => unpublishArticle(id)));
  };

  const onPreview = async () => {
    // Вікно відкриваємо одразу (інакше браузер заблокує), адресу ставимо після збереження
    const win = window.open("about:blank", "_blank");
    if (saveState !== "saved") await save();
    if (win) win.location.href = `/preview/${id}`;
  };

  // ---------- Похідне ----------

  const state =
    status === "DRAFT"
      ? "draft"
      : article.publishedAt && new Date(article.publishedAt).getTime() > now
        ? "scheduled"
        : "published";
  const STATE_LABEL = { draft: "Чернетка", published: "Опубліковано", scheduled: "Заплановано" };

  const blockErrors = useMemo(
    () => Object.fromEntries(issues.filter((i) => i.blockId).map((i) => [i.blockId!, i.message])),
    [issues],
  );
  const fieldError = (field: string) => issues.find((i) => !i.blockId && i.field === field)?.message;

  const addTag = () => {
    const tag = tagDraft.trim().replace(/,$/, "");
    if (tag && !article.tags.includes(tag) && article.tags.length < 10) patch({ tags: [...article.tags, tag] });
    setTagDraft("");
  };

  const authorExists = authors.some((a) => a.id === article.authorId);

  return (
    <div className="ed">
      {/* ---------- Верхня панель ---------- */}
      <div className="ed-bar">
        <Link href="/admin/articles" className="ed-bar__back">
          <Icon name="back" />
          Статті
        </Link>
        <span className={`a-badge a-badge--${state}`}>{STATE_LABEL[state]}</span>
        <span className={`ed-bar__save ed-bar__save--${saveState}`} aria-live="polite">
          {SAVE_LABEL[saveState]}
        </span>

        <div className="ed-bar__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={onPreview}>
            <Icon name="eye" />
            Переглянути
          </button>
          {status === "DRAFT" ? (
            <>
              <button type="button" className="a-btn a-btn--ghost" onClick={save} disabled={saveState === "saving"}>
                <Icon name="save" />
                Зберегти
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={onPublish} disabled={busy}>
                <Icon name="publish" />
                {article.publishedAt && new Date(article.publishedAt).getTime() > now ? "Запланувати" : "Опублікувати"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="a-btn a-btn--primary"
              onClick={save}
              disabled={busy || saveState === "saving" || saveState === "saved"}
            >
              <Icon name="save" />
              Оновити
            </button>
          )}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="ed-issues" role="alert">
          <p className="ed-issues__title">
            {status === "DRAFT" ? "Щоб опублікувати, виправте:" : "Зміни не збережено — виправте:"}
          </p>
          <ul>
            {issues.map((i, n) => (
              <li key={n}>
                {i.blockId ? (
                  <a href={`#block-${i.blockId}`}>{i.message}</a>
                ) : (
                  i.message
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ed-layout">
        {/* ---------- Основне: назва і блоки ---------- */}
        <div className="ed-main">
          <div className={`ed-title ${fieldError("title") ? "has-error" : ""}`.trim()}>
            <textarea
              className="ed-title__input"
              value={article.title}
              rows={1}
              placeholder="Назва статті"
              aria-label="Назва статті"
              maxLength={200}
              onChange={(e) => onTitle(e.target.value.replace(/\n/g, " "))}
            />
            {fieldError("title") && <p className="ed-field__error">{fieldError("title")}</p>}
          </div>

          {fieldError("blocks") && <p className="ed-field__error">{fieldError("blocks")}</p>}
          <BlockList
            blocks={article.blocks}
            errors={blockErrors}
            onChange={onBlockChange}
            onInsert={onInsert}
            onMove={onMove}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        </div>

        {/* ---------- Бічна панель: налаштування ---------- */}
        <aside className="ed-side">
          <section className="ed-card">
            <h2 className="ed-card__title">Публікація</h2>
            <Field
              label="Дата публікації"
              hint={
                status === "DRAFT"
                  ? "Порожньо — опублікується одразу. Дата в майбутньому — стаття зʼявиться тоді."
                  : "Дата в майбутньому сховає статтю до цього часу."
              }
            >
              <input
                type="datetime-local"
                className="ed-input"
                value={toLocalInput(article.publishedAt)}
                onChange={(e) => patch({ publishedAt: fromLocalInput(e.target.value) })}
              />
            </Field>
            {status === "PUBLISHED" && (
              <button type="button" className="ed-link-btn ed-link-btn--danger" onClick={onUnpublish} disabled={busy}>
                Зняти з публікації
              </button>
            )}
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Адреса</h2>
            <Field label="Адреса статті" error={fieldError("slug")}>
              <div className="ed-slug">
                <span className="ed-slug__prefix">/blog/</span>
                <input
                  className="ed-input"
                  value={article.slug}
                  aria-label="Адреса статті"
                  onChange={(e) => {
                    setSlugLocked(true);
                    patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                />
              </div>
            </Field>
            <div className="ed-slug__actions">
              <button
                type="button"
                className="ed-link-btn"
                onClick={() => {
                  if (
                    status === "PUBLISHED" &&
                    !window.confirm("Стаття вже опублікована: старі посилання на неї перестануть працювати. Змінити?")
                  )
                    return;
                  patch({ slug: slugify(article.title) });
                }}
              >
                Згенерувати з назви
              </button>
            </div>
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Обкладинка</h2>
            <ImageInput
              label="Фото обкладинки"
              src={article.coverSrc}
              alt={article.coverAlt}
              error={fieldError("coverSrc")}
              onChange={({ src, alt }) => patch({ coverSrc: src, coverAlt: alt })}
            />
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Автор і теги</h2>
            <Field label="Автор">
              <select className="ed-input" value={article.authorId} onChange={(e) => patch({ authorId: e.target.value })}>
                {!authorExists && <option value={article.authorId}>—</option>}
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.role ? ` — ${a.role}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Теги" hint="Enter або кома — додати тег">
              <div className="ed-tags">
                {article.tags.map((t) => (
                  <span key={t} className="ed-tags__tag">
                    {t}
                    <button
                      type="button"
                      aria-label={`Прибрати тег ${t}`}
                      onClick={() => patch({ tags: article.tags.filter((x) => x !== t) })}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="ed-tags__input"
                  value={tagDraft}
                  placeholder={article.tags.length ? "" : "Події, Молодь…"}
                  aria-label="Новий тег"
                  maxLength={40}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.endsWith(",")) {
                      const tag = v.slice(0, -1).trim();
                      if (tag && !article.tags.includes(tag) && article.tags.length < 10) patch({ tags: [...article.tags, tag] });
                      setTagDraft("");
                    } else setTagDraft(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    } else if (e.key === "Backspace" && !tagDraft && article.tags.length) {
                      patch({ tags: article.tags.slice(0, -1) });
                    }
                  }}
                  onBlur={addTag}
                />
              </div>
            </Field>
          </section>

          <details className="ed-card ed-card--details">
            <summary className="ed-card__title">Пошук і соцмережі</summary>
            <TextInput
              label="Заголовок для Google"
              value={article.seoTitle}
              placeholder={article.title || "Як назва статті"}
              maxLength={200}
              hint={`${article.seoTitle.length}/60 — порожньо: назва статті`}
              onChange={(seoTitle) => patch({ seoTitle })}
            />
            <Textarea
              label="Опис"
              value={article.seoDescription}
              placeholder="Порожньо — перший абзац статті"
              hint={`${article.seoDescription.length}/160`}
              onChange={(seoDescription) => patch({ seoDescription: seoDescription.slice(0, 300) })}
            />
          </details>

          <details className="ed-card ed-card--details" open>
            <summary className="ed-card__title">
              <Icon name="history" /> Історія змін
            </summary>
            {history.length === 0 ? (
              <p className="ed-muted">Ще немає записів</p>
            ) : (
              <ol className="ed-history">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className="ed-history__who">{h.userName ?? "Хтось"}</span> {ACTION_LABEL[h.action]}
                    <time className="ed-history__when" dateTime={h.at}>
                      {formatWhen(h.at)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </details>

          <form
            action={deleteArticle.bind(null, id)}
            onSubmit={(e) => {
              if (!window.confirm("Видалити статтю назавжди? Це не можна скасувати.")) e.preventDefault();
            }}
          >
            <button type="submit" className="ed-link-btn ed-link-btn--danger ed-delete">
              <Icon name="trash" />
              Видалити статтю
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default ArticleEditor;
