import "server-only";
import { headers } from "next/headers";
import { db } from "../db";

/** Скільки невдалих спроб дозволено за вікно — окремо на пошту й на IP */
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;
const WINDOW_MS = 15 * 60 * 1000;

/** IP відвідувача. На VPS nginx передаватиме справжній у X-Forwarded-For / X-Real-IP. */
export const getClientIp = async () => {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
};

export const isLoginBlocked = async (email: string, ip: string) => {
  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    db.loginAttempt.count({ where: { email, createdAt: { gte: since } } }),
    db.loginAttempt.count({ where: { ip, createdAt: { gte: since } } }),
  ]);
  return byEmail >= MAX_PER_EMAIL || byIp >= MAX_PER_IP;
};

export const recordFailedLogin = async (email: string, ip: string) => {
  await db.loginAttempt.create({ data: { email, ip } });
  // Прибираємо старі записи, щоб таблиця не росла
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
};

export const clearFailedLogins = (email: string) => db.loginAttempt.deleteMany({ where: { email } });
