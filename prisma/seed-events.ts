/**
 * Стартові події (ті, що раніше були в коді) — лише якщо їх ще немає.
 * Нічого не перезаписує: подію, змінену в адмінці, не чіпає.
 *   npx tsx prisma/seed-events.ts   (також викликається з npm run db:seed)
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { mediaUrl } from "../src/features/media/urls";
import { processImage } from "../src/server/media/process";

const ASSETS = path.resolve("src/assets");
const DEMO_DATE = new Date("2026-01-12T12:00:00+02:00");

/** Фото в медіатеку (фіксований id — не дублюється) */
const importPhoto = async (db: PrismaClient, id: string, file: string, alt: string) => {
  let media = await db.media.findUnique({ where: { id } });
  if (!media) {
    const input = await readFile(path.join(ASSETS, file));
    const processed = await processImage(input, id, DEMO_DATE);
    media = await db.media.create({
      data: { id, ...processed, originalBytes: input.byteLength, originalName: path.basename(file), alt, createdAt: DEMO_DATE },
    });
  }
  return mediaUrl(media.path);
};

export const seedEvents = async (db: PrismaClient) => {
  const youth = await importPhoto(db, "demo-event-youth", "events/youth.webp", "Молодь на зустрічі");
  const church = await importPhoto(db, "demo-church", "hero/hero-fon.webp", "Зала церкви");

  // 0 — понеділок … 6 — неділя
  const EVENTS = [
    {
      id: "demo-youth",
      title: "Молодіжна зустріч",
      shortTitle: "Молодіжка",
      weekdays: [0],
      startTime: "19:00",
      description:
        "Кожного тижня молодь збирається разом, щоб поклонятися Богу. Це час, де можна знайти справжніх друзів. Приходь сам або приводь когось із друзів.",
      image: youth,
      format: "OFFLINE" as const,
      place: "Молодіжна кімната",
    },
    {
      id: "demo-prayer",
      title: "Молитовне служіння",
      shortTitle: "Молитовне служіння",
      weekdays: [2],
      startTime: "19:00",
      description: "Серед тижня збираємось, щоб разом молитися за церкву, родини, місто та Україну.",
      image: church,
    },
    {
      id: "demo-kids-school",
      title: "Дитяча школа",
      shortTitle: "Дитяча школа",
      weekdays: [5],
      startTime: "11:00",
      description: "Біблійні історії, ігри та творчість для дітей у турботливій атмосфері.",
      image: church,
    },
    {
      id: "demo-teens",
      title: "Підлітковий клуб",
      shortTitle: "Підлітковий клуб",
      weekdays: [5],
      startTime: "18:00",
      description: "Зустрічі для підлітків: спілкування, запитання про віру і час разом із друзями.",
      image: church,
    },
    {
      id: "demo-sunday-morning",
      title: "Ранкове богослужіння",
      shortTitle: "Ранкове богослужіння",
      weekdays: [6],
      startTime: "10:00",
      description: "Недільне богослужіння для всієї церкви: прославлення, молитва і проповідь Божого Слова.",
      image: church,
    },
    {
      id: "demo-sunday-evening",
      title: "Вечірнє богослужіння",
      shortTitle: "Вечірнє богослужіння",
      weekdays: [6],
      startTime: "17:00",
      description: "Вечірнє богослужіння: спільна молитва, прославлення і проповідь.",
      image: church,
    },
  ];

  let created = 0;
  for (const e of EVENTS) {
    if (await db.event.findUnique({ where: { id: e.id } })) continue;
    await db.event.create({ data: { ...e, repeat: "WEEKLY", showInFooter: true, published: true } });
    created++;
  }
  return created;
};

// Окремий запуск: npx tsx prisma/seed-events.ts
if (process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/seed-events.ts")) {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  seedEvents(db)
    .then((n) => console.log(`Події: додано ${n}`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
