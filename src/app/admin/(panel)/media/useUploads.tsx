"use client";

import { useCallback, useState } from "react";
import { uploadImage } from "@/features/media/upload";
import type { MediaItem } from "@/features/media/urls";

export interface UploadTask {
  key: string;
  name: string;
  /** 0..1 — передача файлу; після 1 сервер ще стискає фото */
  progress: number;
  error?: string;
}

/**
 * Черга завантажень із прогресом. Файли йдуть по два одночасно —
 * щоб не забивати слабкий мобільний інтернет.
 */
export const useUploads = (onUploaded: (item: MediaItem) => void) => {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const update = (key: string, p: Partial<UploadTask>) =>
    setTasks((list) => list.map((t) => (t.key === key ? { ...t, ...p } : t)));

  const start = useCallback(
    async (files: File[]) => {
      const batch = files.map((f, i) => ({ file: f, key: `${Date.now()}-${i}-${f.name}` }));
      setTasks((list) => [...list, ...batch.map(({ file, key }) => ({ key, name: file.name, progress: 0 }))]);

      const queue = [...batch];
      const worker = async () => {
        for (let job = queue.shift(); job; job = queue.shift()) {
          const { file, key } = job;
          try {
            const item = await uploadImage(file, { onProgress: (progress) => update(key, { progress }) });
            setTasks((list) => list.filter((t) => t.key !== key));
            onUploaded(item);
          } catch (e) {
            update(key, { error: e instanceof Error ? e.message : "Помилка завантаження" });
          }
        }
      };
      await Promise.all([worker(), worker()]);
    },
    [onUploaded],
  );

  const dismiss = (key: string) => setTasks((list) => list.filter((t) => t.key !== key));

  return { tasks, start, dismiss };
};

/** Список завантажень із прогресом і помилками */
export const UploadList = ({ tasks, onDismiss }: { tasks: UploadTask[]; onDismiss: (key: string) => void }) =>
  tasks.length === 0 ? null : (
    <ul className="m-uploads" aria-live="polite">
      {tasks.map((t) => (
        <li key={t.key} className={`m-uploads__item ${t.error ? "has-error" : ""}`.trim()}>
          <span className="m-uploads__name">{t.name}</span>
          {t.error ? (
            <>
              <span className="m-uploads__error">{t.error}</span>
              <button type="button" className="m-uploads__dismiss" onClick={() => onDismiss(t.key)} aria-label="Прибрати">
                ×
              </button>
            </>
          ) : (
            <span className="m-uploads__status">{t.progress < 1 ? `${Math.round(t.progress * 100)}%` : "Стискаємо…"}</span>
          )}
          {!t.error && (
            <span className="m-uploads__bar" style={{ transform: `scaleX(${Math.max(0.03, t.progress)})` }} />
          )}
        </li>
      ))}
    </ul>
  );
