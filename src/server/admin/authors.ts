import "server-only";
import { db } from "../db";
import { requireUser } from "../auth/session";

export interface AdminAuthor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  articles: number;
}

export const listAdminAuthors = async (): Promise<AdminAuthor[]> => {
  await requireUser();
  const rows = await db.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return rows.map((a) => ({ id: a.id, name: a.name, role: a.role, bio: a.bio, photo: a.photo, articles: a._count.articles }));
};

export const getAdminAuthor = async (id: string): Promise<AdminAuthor | null> => {
  await requireUser();
  const a = await db.author.findUnique({ where: { id }, include: { _count: { select: { articles: true } } } });
  return a ? { id: a.id, name: a.name, role: a.role, bio: a.bio, photo: a.photo, articles: a._count.articles } : null;
};
