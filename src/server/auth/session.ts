import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../db";

export const SESSION_COOKIE = "spas_session";
const SESSION_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Secure-cookie — коли сайт на https (на VPS). Локально на http://localhost теж працює.
const isSecure = () => (process.env.SITE_URL ?? "").startsWith("https://");

/** Створює сесію і ставить cookie. Викликати лише з server action / route handler. */
export const createSession = async (userId: string) => {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;

  await db.session.create({ data: { id: hashToken(token), userId, expiresAt, userAgent } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // недоступна з JavaScript — не вкрадеш через XSS
    sameSite: "lax", // не надсилається з чужих сайтів у POST-запитах
    secure: isSecure(),
    path: "/",
    expires: expiresAt,
  });
};

/** Завершує поточну сесію (вихід) */
export const deleteSession = async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
};

/**
 * Поточний користувач або null. cache() — один запит до бази на рендер,
 * скільки б компонентів його не питали.
 */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * Для сторінок і дій адмінки: без входу — на сторінку входу.
 * proxy.ts перевіряє лише наявність cookie; справжня перевірка — тут,
 * і її треба викликати в КОЖНІЙ сторінці та server action адмінки.
 */
export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
};
