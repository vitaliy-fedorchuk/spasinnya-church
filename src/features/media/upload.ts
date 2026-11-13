import type { MediaItem } from "./urls";

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";

/**
 * Завантажити фото в медіатеку (з браузера). XHR, а не fetch — щоб показувати
 * прогрес. iPhone сам перетворює HEIC на JPEG, коли фото вибирають у браузері.
 */
export const uploadImage = (file: File, { alt = "", onProgress }: { alt?: string; onProgress?: (p: number) => void } = {}) =>
  new Promise<MediaItem>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as MediaItem);
      else reject(new Error((xhr.response as { error?: string } | null)?.error ?? "Не вдалося завантажити фото"));
    };
    xhr.onerror = () => reject(new Error("Немає звʼязку з сервером"));
    xhr.send(form);
  });

export const formatBytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} КБ` : `${(n / 1024 / 1024).toFixed(1)} МБ`;
