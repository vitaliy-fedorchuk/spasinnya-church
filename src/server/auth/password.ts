// Без "server-only": цей модуль використовує і скрипт scripts/create-admin.ts.
// Сам по собі він безпечний — лише хешує й перевіряє.
import { hash, verify } from "@node-rs/argon2";

export const MIN_PASSWORD_LENGTH = 10;

/** argon2id з параметрами за замовчуванням (рекомендації OWASP) */
export const hashPassword = (password: string) => hash(password);

export const verifyPassword = async (passwordHash: string, password: string) => {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
};

// Хеш «нічого»: перевіряємо пароль навіть для неіснуючої пошти,
// щоб за часом відповіді не можна було дізнатись, які адреси є в системі
let dummyHash: Promise<string> | undefined;
export const verifyAgainstDummy = async (password: string) => {
  dummyHash ??= hash("dummy-password-for-timing");
  await verifyPassword(await dummyHash, password);
  return false;
};
