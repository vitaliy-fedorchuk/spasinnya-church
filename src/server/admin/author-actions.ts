"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth/session";

const authorSchema = z.object({
  name: z.string().trim().min(1, "Вкажіть імʼя").max(100),
  role: z.string().trim().max(100),
  bio: z.string().trim().max(1000),
  photo: z.string().trim().max(500),
});

export type AuthorInput = z.infer<typeof authorSchema>;
export type AuthorResult = { ok: true } | { ok: false; error: string };

/** «Новий автор»: порожній запис → одразу на сторінку редагування */
export async function createAuthor() {
  await requireUser();
  const author = await db.author.create({ data: { name: "Новий автор", role: "", photo: "" } });
  redirect(`/admin/authors/${author.id}`);
}

export async function saveAuthor(id: string, input: AuthorInput): Promise<AuthorResult> {
  await requireUser();
  const parsed = authorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Перевірте поля" };
  await db.author.update({ where: { id }, data: parsed.data });
  return { ok: true };
}

/** Видалити можна лише автора без статей (інакше статтям не буде кого показати) */
export async function deleteAuthor(id: string): Promise<AuthorResult> {
  await requireUser();
  const count = await db.article.count({ where: { authorId: id } });
  if (count > 0) return { ok: false, error: `У автора ${count} стат. — спершу призначте їм іншого автора` };
  await db.author.delete({ where: { id } }).catch(() => {});
  redirect("/admin/authors");
}
