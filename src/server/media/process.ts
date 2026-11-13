// Без "server-only": обробку використовує і seed-скрипт.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { MEDIA_WIDTHS } from "../../features/media/urls";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 МБ — з запасом для фото з телефона
const MAX_PIXELS = 60_000_000; // ~ 60 Мп: більше — підозріло (або «бомба»)
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "heif", "tiff"]);
const WEBP_QUALITY = 80;

export const uploadsDir = () => path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR ?? "./uploads");

export class MediaError extends Error {}

export interface ProcessedImage {
  /** «2026/11/<id>» */
  path: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Фото → кілька розмірів webp у UPLOADS_DIR.
 * - формат визначає сама sharp за вмістом файлу (не за назвою чи типом із браузера);
 * - поворот за EXIF (фото з телефона «на боці»);
 * - метадані (EXIF, GPS-координати) НЕ переносяться — sharp їх відкидає;
 * - не збільшує: з маленького фото великий розмір буде таким, як оригінал.
 */
export const processImage = async (input: Buffer, id: string, now = new Date()): Promise<ProcessedImage> => {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError("Файл завеликий — до 20 МБ");

  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new MediaError("Це не схоже на фото, або файл пошкоджений");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new MediaError("Непідтримуваний формат. Підходять JPG, PNG, WEBP, AVIF, GIF");
  }

  const rel = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${id}`;
  const base = path.join(uploadsDir(), rel);
  await mkdir(path.dirname(base), { recursive: true });

  // Розміри вже з урахуванням повороту (EXIF orientation 5–8 = бокові)
  const sideways = (meta.orientation ?? 1) >= 5;
  const width = (sideways ? meta.height : meta.width) ?? 0;
  const height = (sideways ? meta.width : meta.height) ?? 0;

  // Повернуте фото — один раз, далі ріжемо розміри з нього
  const rotated = sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();

  let bytes = 0;
  try {
    for (const w of MEDIA_WIDTHS) {
      const out = await rotated
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      await writeFile(`${base}-${w}.webp`, out);
      bytes = out.byteLength;
    }
  } catch (e) {
    await removeImageFiles(rel);
    throw e;
  }

  return { path: rel, width, height, bytes };
};

/** Видалити всі розміри фото з диска */
export const removeImageFiles = async (rel: string) => {
  const base = path.join(uploadsDir(), rel);
  await Promise.all(MEDIA_WIDTHS.map((w) => rm(`${base}-${w}.webp`, { force: true })));
};
