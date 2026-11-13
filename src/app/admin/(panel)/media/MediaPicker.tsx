"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/features/media/urls";
import { ACCEPT_IMAGES } from "@/features/media/upload";
import { listMedia } from "@/server/media/actions";
import { UploadList, useUploads } from "./useUploads";
import { Icon } from "../icons";
import "./media.scss";

interface Props {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}

/** Вікно «Медіатека»: вибрати фото або завантажити нове (одне нове — вибирається одразу) */
const MediaPicker = ({ onSelect, onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const singleUploadRef = useRef(false);

  useEffect(() => {
    const d = dialogRef.current;
    d?.showModal();
    return () => d?.close();
  }, []);

  // Пошук із затримкою — не смикати сервер на кожну літеру
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await listMedia({ q });
      if (cancelled) return;
      setItems(res.items);
      setCursor(res.nextCursor);
      setLoading(false);
    }, q ? 300 : 0);
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

  const onUploaded = useCallback(
    (item: MediaItem) => {
      if (singleUploadRef.current) onSelect(item);
      else setItems((list) => [item, ...list]);
    },
    [onSelect],
  );
  const { tasks, start, dismiss } = useUploads(onUploaded);

  return (
    <dialog
      ref={dialogRef}
      className="m-picker"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-label="Медіатека"
    >
      <div className="m-picker__inner">
        <header className="m-picker__head">
          <h2 className="m-picker__title">Медіатека</h2>
          <button type="button" className="m-picker__close" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </header>

        <div className="m-picker__toolbar">
          <input
            className="a-input m-picker__search"
            type="search"
            placeholder="Пошук за описом або назвою файлу…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Пошук фото"
          />
          <label className="a-btn a-btn--primary">
            <Icon name="upload" />
            Завантажити
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              hidden
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                singleUploadRef.current = files.length === 1;
                if (files.length) start(files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <UploadList tasks={tasks} onDismiss={dismiss} />

        <div className="m-picker__body">
          {!loading && items.length === 0 ? (
            <p className="m-empty">{q ? "Нічого не знайдено." : "Тут поки немає фото — завантажте перше."}</p>
          ) : (
            <ul className="m-grid">
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" className="m-tile" onClick={() => onSelect(item)} title={item.alt || item.originalName}>
                    <img src={item.thumb} alt="" loading="lazy" />
                    <span className="m-tile__name">{item.alt || item.originalName}</span>
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
      </div>
    </dialog>
  );
};

export default MediaPicker;
