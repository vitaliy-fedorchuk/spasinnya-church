/**
 * Створити користувача адмінки або оновити існуючого.
 *
 *   npm run admin:create -- --email pastor@example.com --name "Микола Климчук" [--role ADMIN|EDITOR]
 *                           [--avatar шлях/до/фото.jpg] [--password ...] [--reset-password]
 *
 * Новий користувач: без --password генерується надійний пароль і показується ОДИН раз.
 * Існуючий: оновлюються імʼя / роль / фото; пароль змінюється лише з --password
 * або --reset-password (тоді всі його входи завершуються).
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type UserRole } from "../src/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/server/auth/password";
import { processImage } from "../src/server/media/process";
import { mediaUrl } from "../src/features/media/urls";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    password: { type: "string" },
    "reset-password": { type: "boolean", default: false },
    avatar: { type: "string" },
  },
});

const email = values.email?.trim().toLowerCase();
const role = values.role?.toUpperCase() as UserRole | undefined;

if (!email || !email.includes("@") || (role && role !== "ADMIN" && role !== "EDITOR")) {
  console.error('Використання: npm run admin:create -- --email you@example.com --name "Імʼя" [--role ADMIN|EDITOR] [--avatar фото.jpg]');
  process.exit(1);
}
if (values.password && values.password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Пароль має бути не коротший за ${MIN_PASSWORD_LENGTH} символів`);
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/** Фото → медіатека (та сама обробка, що й завантаження з адмінки) */
const importAvatar = async (file: string, userId: string) => {
  const id = `m${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
  const processed = await processImage(await readFile(file), id);
  await db.media.create({
    data: { id, ...processed, originalName: path.basename(file), alt: "Фото профілю", uploadedById: userId },
  });
  return mediaUrl(processed.path);
};

const main = async () => {
  const existing = await db.user.findUnique({ where: { email } });
  const newPassword = values.password ?? (!existing || values["reset-password"] ? randomBytes(12).toString("base64url") : null);

  const user = existing
    ? await db.user.update({
        where: { email },
        data: {
          ...(values.name && { name: values.name }),
          ...(role && { role }),
          ...(newPassword && { passwordHash: await hashPassword(newPassword) }),
        },
      })
    : await db.user.create({
        data: {
          email,
          name: values.name ?? email.split("@")[0],
          role: role ?? "ADMIN",
          passwordHash: await hashPassword(newPassword!),
        },
      });

  if (values.avatar) {
    const avatar = await importAvatar(values.avatar, user.id);
    await db.user.update({ where: { id: user.id }, data: { avatar } });
    console.log(`Фото профілю: ${avatar}`);
  }

  if (existing && newPassword) {
    // Новий пароль — старі входи більше не дійсні
    await db.session.deleteMany({ where: { userId: user.id } });
  }

  console.log(existing ? `Оновлено ${email}.` : `Створено ${email} (${user.role}).`);
  if (newPassword && !values.password) console.log(`Пароль: ${newPassword}\nЗбережіть його — більше він ніде не показується.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
