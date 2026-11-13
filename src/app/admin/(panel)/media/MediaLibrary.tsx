"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MediaAlbumItem, MediaFilters, MediaItem, MediaOrientation, MediaSort } from "@/features/media/urls";
import { ACCEPT_IMAGES, formatBytes } from "@/features/media/upload";
import {
  createAlbum,
  deleteAlbum,
  deleteMedia,
  deleteMediaMany,
  getMediaOverview,
  getMediaUsage,
  listMedia,
  moveMedia,
  renameAlbum,
  updateMediaAlt,
} from "@/server/media/actions";
import { UploadList, useUploads } from "./useUploads";
import { Icon } from "../icons";

type Usage = Awaited<ReturnType<typeof getMediaUsage>>;
type Overview = Awaited<ReturnType<typeof getMediaOverview>>;

const MONTHS = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
const periodLabel = (p: string) => {
  const [y, m] = p.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
};
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
const savings = (orig: number, now: number) => (orig > 0 ? Math.round((1 - now / orig) * 100) : 0);

// ---------- Панель одного фото ----------

const MediaDetails = ({
  item,
  albums,
  onChanged,
  onMoved,
  onDeleted,
  onClose,
}: {
  item: MediaItem;
  albums: MediaAlbumItem[];
  onChanged: (item: MediaItem) => void;
  onMoved: (albumId: string | null) => void;
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

  const used = usage ? usage.articles.length + usage.authors.length + usage.users.length : 0;

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

  return (
    <aside className="m-details" aria-label="Фото">
      <div className="m-details__head">
        <span className="m-details__title">Фото</span>
        <button type="button" className="m-picker__close" onClick={onClose} aria-label="Закрити">
          <Icon name="close" />
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
            {item.width} × {item.height}
          </dd>
        </div>
        <div>
          <dt>Вага</dt>
          <dd>
            {item.originalBytes ? (
              <>
                {formatBytes(item.originalBytes)} → <b>{formatBytes(item.bytes)}</b>{" "}
                <span className="m-details__save">−{savings(item.originalBytes, item.bytes)}%</span>
              </>
            ) : (
              formatBytes(item.bytes)
            )}
          </dd>
        </div>
        <div>
          <dt>Додано</dt>
          <dd>{formatDate(item.createdAt)}</dd>
        </div>
      </dl>

      <label className="a-field">
        <span className="a-field__label">Альбом</span>
        <select
          className="a-input m-details__album"
          value={item.albumId ?? ""}
          onChange={async (e) => {
            const albumId = e.target.value || null;
            await moveMedia([item.id], albumId);
            onMoved(albumId);
            setMessage({ text: "Переміщено" });
          }}
        >
          <option value="">Без альбому</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

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
              <li key={a.id}>
                <Link href={`/admin/authors/${a.id}`}>Автор: {a.name}</Link>
              </li>
            ))}
            {usage.users.map((u) => (
              <li key={u.id}>Фото профілю: {u.name}</li>
            ))}
          </ul>
        )}
      </div>

      {message && <p className={`m-details__msg ${message.error ? "is-error" : ""}`}>{message.text}</p>}

      <div className="m-details__actions">
        <button
          type="button"
          className="ed-link-btn"
          onClick={async () => {
            await navigator.clipboard.writeText(item.url).catch(() => {});
            setMessage({ text: "Адресу скопійовано" });
          }}
        >
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

// ---------- Альбоми ----------

const AlbumItem = ({
  id,
  label,
  count,
  cover,
  current,
  onSelect,
}: {
  id: string;
  label: string;
  count: number;
  cover?: string | null;
  current: string;
  onSelect: (id: string) => void;
}) => (
  <button
    type="button"
    className={`m-albums__item ${current === id ? "is-active" : ""}`.trim()}
    onClick={() => onSelect(id)}
    aria-current={current === id ? "true" : undefined}
  >
    <span className="m-albums__cover">
      {cover ? <img src={cover} alt="" /> : <Icon name={id === "all" ? "media" : id === "none" ? "image" : "gallery"} />}
    </span>
    <span className="m-albums__name">{label}</span>
    <span className="m-albums__count">{count}</span>
  </button>
);

const Albums = ({
  overview,
  current,
  onSelect,
  onChanged,
}: {
  overview: Overview;
  current: string;
  onSelect: (album: string) => void;
  onChanged: () => void;
}) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);

  const submitNew = async () => {
    if (!name.trim()) return setCreating(false);
    const album = await createAlbum(name);
    setName("");
    setCreating(false);
    onChanged();
    onSelect(album.id);
  };

  const active = overview.albums.find((a) => a.id === current);

  return (
    <nav className="m-albums" aria-label="Альбоми">
      <div className="m-albums__head">
        <span>Альбоми</span>
        <button type="button" className="m-albums__add" onClick={() => setCreating(true)} title="Новий альбом">
          <Icon name="plus" />
        </button>
      </div>

      <AlbumItem id="all" label="Усі фото" count={overview.stats.total} current={current} onSelect={onSelect} />
      <AlbumItem id="none" label="Без альбому" count={overview.stats.withoutAlbum} current={current} onSelect={onSelect} />
      {overview.albums.length > 0 && <span className="m-albums__sep" />}
      {overview.albums.map((a) => (
        <AlbumItem key={a.id} id={a.id} label={a.name} count={a.count} cover={a.cover} current={current} onSelect={onSelect} />
      ))}

      {/* На планшеті й телефоні заголовка колонки немає — кнопка окремою «пігулкою» */}
      {!creating && (
        <button type="button" className="m-albums__add-chip" onClick={() => setCreating(true)}>
          <Icon name="plus" />
          Альбом
        </button>
      )}

      {creating && (
        <form
          className="m-albums__new"
          onSubmit={(e) => {
            e.preventDefault();
            submitNew();
          }}
        >
          <input
            className="a-input"
            autoFocus
            value={name}
            maxLength={80}
            placeholder="Назва: «Табір 2026»"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setCreating(false)}
            onBlur={submitNew}
            aria-label="Назва нового альбому"
          />
        </form>
      )}

      {active && (
        <div className="m-albums__manage">
          {renaming !== null ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (renaming.trim()) await renameAlbum(active.id, renaming);
                setRenaming(null);
                onChanged();
              }}
            >
              <input
                className="a-input"
                autoFocus
                value={renaming}
                maxLength={80}
                onChange={(e) => setRenaming(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setRenaming(null)}
                aria-label="Нова назва альбому"
              />
            </form>
          ) : (
            <>
              <button type="button" className="ed-link-btn" onClick={() => setRenaming(active.name)}>
                <Icon name="edit" />
                Перейменувати
              </button>
              <button
                type="button"
                className="ed-link-btn ed-link-btn--danger"
                onClick={async () => {
                  if (!window.confirm(`Видалити альбом «${active.name}»? Фото лишаться в медіатеці («Без альбому»).`)) return;
                  await deleteAlbum(active.id);
                  onSelect("all");
                  onChanged();
                }}
              >
                <Icon name="trash" />
                Видалити альбом
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// ---------- Медіатека ----------

const MediaLibrary = ({ initialOverview }: { initialOverview: Overview }) => {
  const [overview, setOverview] = useState(initialOverview);
  const [filters, setFilters] = useState<MediaFilters>({ album: "all", sort: "new" });
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const requestRef = useRef(0);

  const refreshOverview = useCallback(() => getMediaOverview().then(setOverview), []);

  // Завантаження списку при зміні фільтрів (пошук — із затримкою)
  useEffect(() => {
    const req = ++requestRef.current;
    const t = setTimeout(
      async () => {
        setLoading(true);
        const res = await listMedia(filters);
        if (req !== requestRef.current) return;
        setItems(res.items);
        setTotal(res.total);
        setNextOffset(res.nextOffset);
        setLoading(false);
      },
      filters.q ? 300 : 0,
    );
    return () => clearTimeout(t);
  }, [filters]);

  const setFilter = (p: Partial<MediaFilters>) => {
    setFilters((f) => ({ ...f, ...p }));
    setSelected([]);
  };

  const loadMore = async () => {
    if (nextOffset === null) return;
    setLoading(true);
    const res = await listMedia({ ...filters, offset: nextOffset });
    setItems((list) => [...list, ...res.items]);
    setNextOffset(res.nextOffset);
    setLoading(false);
  };

  // Нові фото — у поточний альбом (якщо відкритий конкретний альбом)
  const uploadAlbum = filters.album && filters.album !== "all" && filters.album !== "none" ? filters.album : null;
  const onUploaded = useCallback(
    (item: MediaItem) => {
      setItems((list) => [{ ...item, used: false }, ...list]);
      setTotal((n) => n + 1);
      refreshOverview();
    },
    [refreshOverview],
  );
  const { tasks, start, dismiss } = useUploads(onUploaded, uploadAlbum);

  const takeFiles = (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith("image/"));
    if (files.length) start(files);
  };

  const toggleSelect = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const bulkMove = async (albumId: string | null) => {
    const n = await moveMedia(selected, albumId);
    setNotice(`Переміщено фото: ${n}`);
    setSelected([]);
    setFilters((f) => ({ ...f })); // перечитати список
    refreshOverview();
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Видалити вибрані фото (${selected.length})? Ті, що десь використані, лишаться.`)) return;
    const res = await deleteMediaMany(selected);
    setNotice(`Видалено: ${res.deleted}${res.skipped ? ` · пропущено (використані): ${res.skipped}` : ""}`);
    setSelected([]);
    setFilters((f) => ({ ...f }));
    refreshOverview();
  };

  const detail = items.find((i) => i.id === detailId) ?? null;
  const { stats } = overview;
  const currentAlbum = overview.albums.find((a) => a.id === filters.album);
  const activeFilters = !!(filters.q || filters.period || filters.orientation || filters.missingAlt || filters.unused);

  return (
    <div className={`m-lib ${detail ? "has-details" : ""}`.trim()}>
      <Albums overview={overview} current={filters.album ?? "all"} onSelect={(album) => setFilter({ album })} onChanged={refreshOverview} />

      <div className="m-lib__main">
        <p className="m-lib__stats">
          {stats.total} фото · на сайті {formatBytes(stats.bytes)}
          {stats.originalBytes > 0 && (
            <>
              {" "}
              · стиснуто з {formatBytes(stats.originalBytes)}{" "}
              <span className="m-details__save">−{savings(stats.originalBytes, stats.compressedOfKnown)}%</span>
            </>
          )}
        </p>

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
          <p className="m-drop__text">
            Перетягніть фото сюди{currentAlbum ? <> — вони потраплять в альбом «{currentAlbum.name}»</> : null}
          </p>
          <p className="m-drop__hint">
            JPG, PNG, WEBP, AVIF, GIF · до 20 МБ · можна кілька · стискаються автоматично
          </p>
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

        {/* ---------- Фільтри ---------- */}
        <div className="m-filters">
          <label className="articles__search m-filters__search">
            <Icon name="search" />
            <span className="visually-hidden">Пошук фото</span>
            <input
              className="a-input"
              type="search"
              placeholder="Пошук за описом або назвою…"
              value={filters.q ?? ""}
              onChange={(e) => setFilter({ q: e.target.value })}
            />
          </label>

          <select
            className="a-input articles__select"
            value={filters.period ?? ""}
            onChange={(e) => setFilter({ period: e.target.value || undefined })}
            aria-label="Період"
          >
            <option value="">Увесь час</option>
            {[...new Set(overview.periods.map((p) => p.slice(0, 4)))].map((y) => (
              <optgroup key={y} label={y}>
                <option value={y}>Увесь {y}</option>
                {overview.periods
                  .filter((p) => p.startsWith(y))
                  .map((p) => (
                    <option key={p} value={p}>
                      {periodLabel(p)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>

          <select
            className="a-input articles__select"
            value={filters.orientation ?? ""}
            onChange={(e) => setFilter({ orientation: (e.target.value || undefined) as MediaOrientation | undefined })}
            aria-label="Орієнтація"
          >
            <option value="">Будь-яка форма</option>
            <option value="landscape">Горизонтальні</option>
            <option value="portrait">Вертикальні</option>
            <option value="square">Квадратні</option>
          </select>

          <select
            className="a-input articles__select"
            value={filters.sort ?? "new"}
            onChange={(e) => setFilter({ sort: e.target.value as MediaSort })}
            aria-label="Сортування"
          >
            <option value="new">Спершу нові</option>
            <option value="old">Спершу старі</option>
            <option value="name">За назвою</option>
            <option value="size">Найважчі оригінали</option>
          </select>

          <button
            type="button"
            className={`m-chip ${filters.missingAlt ? "is-on" : ""}`.trim()}
            aria-pressed={!!filters.missingAlt}
            onClick={() => setFilter({ missingAlt: !filters.missingAlt || undefined })}
          >
            Без опису
          </button>
          <button
            type="button"
            className={`m-chip ${filters.unused ? "is-on" : ""}`.trim()}
            aria-pressed={!!filters.unused}
            onClick={() => setFilter({ unused: !filters.unused || undefined })}
          >
            Не використані
          </button>
        </div>

        <div className="m-lib__summary">
          <span>
            {currentAlbum?.name ?? (filters.album === "none" ? "Без альбому" : "Усі фото")}: {total}
          </span>
          {activeFilters && (
            <button
              type="button"
              className="ed-link-btn"
              onClick={() => setFilter({ q: undefined, period: undefined, orientation: undefined, missingAlt: undefined, unused: undefined })}
            >
              Скинути фільтри
            </button>
          )}
          {items.length > 0 && (
            <button
              type="button"
              className="ed-link-btn"
              onClick={() => setSelected(selected.length === items.length ? [] : items.map((i) => i.id))}
            >
              {selected.length === items.length ? "Зняти вибір" : "Вибрати всі на екрані"}
            </button>
          )}
        </div>

        {notice && (
          <p className="m-lib__notice" role="status">
            {notice}
          </p>
        )}

        {selected.length > 0 && (
          <div className="tags__merge m-bulk">
            <span>
              Вибрано: <b>{selected.length}</b>
            </span>
            <span className="tags__merge-form">
              <select
                className="a-input"
                value=""
                onChange={(e) => e.target.value && bulkMove(e.target.value === "none" ? null : e.target.value)}
                aria-label="Перемістити в альбом"
              >
                <option value="">Перемістити в альбом…</option>
                <option value="none">Без альбому</option>
                {overview.albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button type="button" className="a-btn a-btn--primary" onClick={bulkDelete}>
                <Icon name="trash" />
                Видалити
              </button>
              <button type="button" className="ed-link-btn" onClick={() => setSelected([])}>
                Скасувати
              </button>
            </span>
          </div>
        )}

        {!loading && items.length === 0 ? (
          <p className="m-empty">{activeFilters ? "Нічого не знайдено." : "Тут поки немає фото."}</p>
        ) : (
          <ul className={`m-grid ${selected.length ? "is-selecting" : ""}`.trim()}>
            {items.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <li key={item.id} className="m-grid__cell">
                  <button
                    type="button"
                    className={`m-tile ${item.id === detailId ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`.trim()}
                    onClick={() => (selected.length ? toggleSelect(item.id) : setDetailId(item.id))}
                    title={item.alt || item.originalName}
                  >
                    <img src={item.thumb} alt="" loading="lazy" />
                    <span className="m-tile__name">{item.alt || item.originalName}</span>
                    <span className="m-tile__badges">
                      {!item.alt && <span className="m-tile__warn">без опису</span>}
                      {item.used === false && <span className="m-tile__unused">не використане</span>}
                    </span>
                  </button>
                  <label className="m-tile__check" title="Вибрати">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} />
                    <span className="visually-hidden">Вибрати фото</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {nextOffset !== null && (
          <button type="button" className="a-btn a-btn--ghost m-more" onClick={loadMore} disabled={loading}>
            Показати ще (залишилось {total - items.length})
          </button>
        )}
      </div>

      {detail && (
        <MediaDetails
          key={detail.id}
          item={detail}
          albums={overview.albums}
          onChanged={(item) => setItems((list) => list.map((i) => (i.id === item.id ? { ...item, used: i.used } : i)))}
          onMoved={(albumId) => {
            setItems((list) => list.map((i) => (i.id === detail.id ? { ...i, albumId } : i)));
            refreshOverview();
          }}
          onDeleted={(id) => {
            setItems((list) => list.filter((i) => i.id !== id));
            setTotal((n) => n - 1);
            setDetailId(null);
            refreshOverview();
          }}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
