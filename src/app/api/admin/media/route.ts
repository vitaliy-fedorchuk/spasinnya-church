import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { toMediaItem } from "@/server/media/library";
import { MAX_UPLOAD_BYTES, MediaError, processImage, removeImageFiles } from "@/server/media/process";

/**
 * Завантаження фото: POST multipart/form-data { file, alt? } → MediaItem.
 * Окремий обробник (не server action): у server actions ліміт тіла 1 МБ,
 * а фото з телефона важать 5–10 МБ. Адреса поза /admin, щоб proxy.ts
 * не буферизував великі тіла запитів; вхід перевіряємо тут.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Потрібно увійти" }, { status: 401 });

  // Грубий фільтр ще до читання тіла (+1 МБ на службові частини форми)
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return Response.json({ error: "Файл завеликий — до 20 МБ" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Не вдалося прочитати файл" }, { status: 400 });
  }
  const f = form.get("file");
  const file = f instanceof File ? f : null;
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
  // Альбом, у який завантажуємо (якщо такого немає — «Без альбому»)
  const albumParam = String(form.get("albumId") ?? "");
  const albumId = albumParam && (await db.mediaAlbum.count({ where: { id: albumParam } })) ? albumParam : null;
  if (!file || file.size === 0) return Response.json({ error: "Файл не вибрано" }, { status: 400 });

  // Власний id: потрібен для імені файлів ще до запису в базу
  const id = `m${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;

  try {
    const processed = await processImage(Buffer.from(await file.arrayBuffer()), id);
    try {
      const row = await db.media.create({
        data: {
          id,
          ...processed,
          originalName: file.name.slice(0, 200) || "фото",
          originalBytes: file.size,
          albumId,
          alt,
          uploadedById: user.id,
        },
      });
      return Response.json(toMediaItem(row));
    } catch (e) {
      await removeImageFiles(processed.path);
      throw e;
    }
  } catch (e) {
    if (e instanceof MediaError) return Response.json({ error: e.message }, { status: 415 });
    console.error("[media] upload failed", e);
    return Response.json({ error: "Не вдалося обробити фото" }, { status: 500 });
  }
}
