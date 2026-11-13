"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { verifyAgainstDummy, verifyPassword } from "./password";
import { clearFailedLogins, getClientIp, isLoginBlocked, recordFailedLogin } from "./rate-limit";
import { createSession, deleteSession } from "./session";

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

/** Куди повернутись після входу — лише всередину адмінки (без відкритих редиректів) */
const safeNext = (next?: string) =>
  next && next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login")
    ? next
    : "/admin";

const WRONG = "Невірна пошта або пароль";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: WRONG, email: String(formData.get("email") ?? "") };

  const { email, password, next } = parsed.data;
  const ip = await getClientIp();

  if (await isLoginBlocked(email, ip)) {
    return { error: "Забагато спроб. Спробуйте за 15 хвилин.", email };
  }

  const user = await db.user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(user.passwordHash, password) : await verifyAgainstDummy(password);

  if (!user || !ok) {
    await recordFailedLogin(email, ip);
    return { error: WRONG, email };
  }

  await clearFailedLogins(email);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);

  redirect(safeNext(next));
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
