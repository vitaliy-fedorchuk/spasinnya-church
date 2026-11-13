/**
 * Створити користувача адмінки або скинути йому пароль.
 *
 *   npm run admin:create -- --email pastor@example.com --name "Микола" [--role ADMIN|EDITOR] [--password ...]
 *
 * Без --password генерується надійний пароль і показується ОДИН раз.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/server/auth/password";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "ADMIN" },
    password: { type: "string" },
  },
});

const email = values.email?.trim().toLowerCase();
const role = values.role?.toUpperCase();

if (!email || !email.includes("@") || (role !== "ADMIN" && role !== "EDITOR")) {
  console.error('Використання: npm run admin:create -- --email you@example.com --name "Імʼя" [--role ADMIN|EDITOR]');
  process.exit(1);
}

const password = values.password ?? randomBytes(12).toString("base64url");
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Пароль має бути не коротший за ${MIN_PASSWORD_LENGTH} символів`);
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const main = async () => {
  const passwordHash = await hashPassword(password);
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    await db.user.update({ where: { email }, data: { passwordHash, role, ...(values.name && { name: values.name }) } });
    // Новий пароль — старі входи більше не дійсні
    await db.session.deleteMany({ where: { userId: existing.id } });
    console.log(`Пароль для ${email} оновлено, всі старі сесії завершено.`);
  } else {
    await db.user.create({ data: { email, name: values.name ?? email.split("@")[0], role, passwordHash } });
    console.log(`Створено користувача ${email} (${role}).`);
  }

  if (!values.password) console.log(`Пароль: ${password}\nЗбережіть його — більше він ніде не показується.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
