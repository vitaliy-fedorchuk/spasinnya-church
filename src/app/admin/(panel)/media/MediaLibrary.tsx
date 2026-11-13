"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MediaItem } from "@/features/media/urls";
import { ACCEPT_IMAGES, formatBytes } from "@/features/media/upload";
import { deleteMedia, getMediaUsage, listMedia, updateMediaAlt } from "@/server/media/actions";
import { UploadList, useUploads } from "./useUploads";
import { Icon } from "../icons";

type Usage = Awaited<ReturnType<typeof getMediaUsage>>;

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

// ---------- Панель одного фото ----------

const MediaDetails = ({
  item,
  onChanged,
  onDeleted,
  onClose,
}: {
  item: MediaItem;
  onChanged: (item: MediaItem) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) => {
  const [alt, setAlt] = useState(item.alt);
  const [usage, setUsage] = useState<Usage>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMediaUsage(item.id).then((u) => !cancelled && setUsage(u));
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const used = usage ? usage.articles.length + usage.authors.length : 0;

  const saveAlt = async () => {
    setBusy(true);
    try {
      onChanged(await updateMediaAlt(item.id, alt));
      setMessage({ text: "Опис збережено" });
    } catch {
      setMessage({ text: "Не вдалося зберегти", error: true });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Видалити фото назавжди?")) return;
    setBusy(true);
    const res = await deleteMedia(item.id);
    setBusy(false);
    if (res.ok) onDeleted(item.id);
    else setMessage({ text: res.error, error: true });
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(item.url).catch(() => {});
    setMessage({ text: "Адресу скопійовано" });
  };

  return (
    <aside className="m-details" aria-label="Фото">
      <div className="m-details__head">
        <span className="m-details__title">Фото</span>
        <button type="button" className="m-picker__close" onClick={onClose} aria-label="Закрити">
          ×
        </button>
      </div>

      <a className="m-details__preview" href={item.url} target="_blank" rel="noreferrer">
        <img src={item.url.replace(/-1600\.webp$/, "-960.webp")} alt={item.alt} />
      </a>

      <dl className="m-details__info">
        <div>
          <dt>Файл</dt>
          <dd title={item.originalName}>{item.originalName}</dd>
        </div>
        <div>
          <dt>Розмір</dt>
          <dd>
            {item.width} × {item.height} · {formatBytes(item.bytes)}
          </dd>
        </div>
        <div>
          <dt>Додано</dt>
          <dd>{formatDate(item.createdAt)}</dd>
        </div>
      </dl>

      <label className="a-field">
        <span className="a-field__label">Опис фото</span>
        <textarea
          className="a-input m-details__alt"
          value={alt}
          rows={2}
          maxLength={300}
          placeholder="Що на фото — для незрячих і пошуку"
          onChange={(e) => setAlt(e.target.value)}
        />
      </label>
      <button type="button" className="a-btn a-btn--primary" onClick={saveAlt} disabled={busy || alt === item.alt}>
        Зберегти опис
      </button>

      <div className="m-details__usage">
        <span className="a-field__label">Де використане</span>
        {!usage ? (
          <p className="m-muted">Перевіряємо…</p>
        ) : used === 0 ? (
          <p className="m-muted">Ніде — можна видалити</p>
        ) : (
          <ul>
            {usage.articles.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/articles/${a.id}`}>{a.title || "Без назви"}</Link>
              </li>
            ))}
            {usage.authors.map((a) => (
              <li key={a.id}>Автор: {a.name}</li>
            ))}
          </ul>
        )}
      </div>

      {message && <p className={`m-details__msg ${message.error ? "is-error" : ""}`}>{message.text}</p>}

      <div className="m-details__actions">
        <button type="button" className="ed-link-btn" onClick={copyUrl}>
          <Icon name="link" />
          Копіювати адресу
        </button>
        <button type="button" className="ed-link-btn ed-link-btn--danger" onClick={remove} disabled={busy || used > 0}>
          <Icon name="trash" />
          Видалити
        </button>
      </div>
    </aside>
  );
};

// ---------- Медіатека ----------

const MediaLibrary = ({ initialItems, initialCursor }: { initialItems: MediaItem[]; initialCursor: string | null }) => {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);

  const onUploaded = useCallback((item: MediaItem) => setItems((list) => [item, ...list]), []);
  const { tasks, start, dismiss } = useUploads(onUploaded);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await listMedia({ q });
      if (cancelled) return;
      setItems(res.items);
      setCursor(res.nextCursor);
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    const res = await listMedia({ q, cursor });
    setItems((list) => [...list, ...res.items]);
    setCursor(res.nextCursor);
    setLoading(false);
  };

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const takeFiles = (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith("image/"));
    if (files.length) start(files);
  };

  return (
    <div className={`m-library ${selected ? "has-details" : ""}`.trim()}>
      <div className="m-library__main">
        <div
          className={`m-drop ${dragOver ? "is-over" : ""}`.trim()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            takeFiles(e.dataTransfer.files);
          }}
        >
          <p className="m-drop__text">Перетягніть фото сюди</p>
          <p className="m-drop__hint">JPG, PNG, WEBP, AVIF, GIF · до 20 МБ · можна кілька</p>
          <label className="a-btn a-btn--primary">
            <Icon name="upload" />
            Вибрати файли
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              hidden
              onChange={(e) => {
                takeFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <UploadList tasks={tasks} onDismiss={dismiss} />

        <input
          className="a-input m-library__search"
          type="search"
          placeholder="Пошук за описом або назвою файлу…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Пошук фото"
        />

        {!loading && items.length === 0 ? (
          <p className="m-empty">{q ? "Нічого не знайдено." : "Тут поки немає фото."}</p>
        ) : (
          <ul className="m-grid">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`m-tile ${item.id === selectedId ? "is-selected" : ""}`.trim()}
                  onClick={() => setSelectedId(item.id)}
                  title={item.alt || item.originalName}
                >
                  <img src={item.thumb} alt="" loading="lazy" />
                  <span className="m-tile__name">{item.alt || item.originalName}</span>
                  {!item.alt && <span className="m-tile__warn">без опису</span>}
                </button>
              </li>
            ))}
          </ul>
        )}

        {cursor && (
          <button type="button" className="a-btn a-btn--ghost m-more" onClick={loadMore} disabled={loading}>
            Показати ще
          </button>
        )}
      </div>

      {selected && (
        <MediaDetails
          key={selected.id}
          item={selected}
          onChanged={(item) => setItems((list) => list.map((i) => (i.id === item.id ? item : i)))}
          onDeleted={(id) => {
            setItems((list) => list.filter((i) => i.id !== id));
            setSelectedId(null);
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
