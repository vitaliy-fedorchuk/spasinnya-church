/**
 * Демо-дані: автор і три статті з усіма видами блоків.
 * Запуск: npm run db:seed (можна повторювати — дані оновлюються, а не дублюються).
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { articleBlockSchema, type ArticleBlock } from "../src/features/blog/types";
import { mediaUrl } from "../src/features/media/urls";
import { processImage } from "../src/server/media/process";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ASSETS = path.resolve("src/assets");

// Демо-фото проходять ту саму обробку, що й завантаження з адмінки,
// і лягають у медіатеку (з фіксованими id — повторний seed їх не дублює)
const DEMO_FILES = {
  author: { file: "news/author.webp", alt: "Пастор Климчук Микола" },
  news1: { file: "news/news-1.webp", alt: "Діти й молодь на святковому служінні" },
  news2: { file: "news/news-2.webp", alt: "Молодіжне служіння в залі церкви" },
  news3: { file: "news/news-3.webp", alt: "Молодь під час прославлення" },
  videoPoster: { file: "about/video-poster.webp", alt: "Квіти й скрипка в залі церкви" },
  pastor: { file: "welcome/pastor.webp", alt: "Пастор Климчук Микола" },
} as const;

type DemoFile = keyof typeof DEMO_FILES;
const DEMO_DATE = new Date("2026-01-12T12:00:00+02:00");
const urls = {} as Record<DemoFile, string>;
const url = (key: DemoFile) => urls[key];

const importDemoMedia = async () => {
  for (const [key, { file, alt }] of Object.entries(DEMO_FILES) as [DemoFile, (typeof DEMO_FILES)[DemoFile]][]) {
    const id = `demo-${key.toLowerCase()}`;
    let media = await db.media.findUnique({ where: { id } });
    if (!media) {
      const input = await readFile(path.join(ASSETS, file));
      const processed = await processImage(input, id, DEMO_DATE);
      media = await db.media.create({
        data: { id, ...processed, originalBytes: input.byteLength, originalName: path.basename(file), alt, createdAt: DEMO_DATE },
      });
    }
    urls[key] = mediaUrl(media.path);
  }
};

interface DemoArticle {
  slug: string;
  title: string;
  tags: string[];
  publishedAt: Date;
  cover: { src: string; alt: string };
  blocks: ArticleBlock[];
}

// Функція, а не константа: адреси фото відомі лише після importDemoMedia()
const buildArticles = (): DemoArticle[] => [
  {
    slug: "richnytsia-tserkvy",
    title: "Святкове богослужіння з нагоди річниці Церкви",
    tags: ["Події", "Церква", "Молодь"],
    publishedAt: new Date("2026-01-12T12:00:00+02:00"),
    cover: { src: url("news1"), alt: "Зала церкви під час святкового богослужіння" },
    blocks: [
      {
        id: "b1",
        type: "lead",
        text: "Цієї неділі ми зібралися всією церковною родиною, щоб подякувати Богові за ще один рік вірності, зростання і спільного служіння.",
      },
      {
        id: "b2",
        type: "text",
        paragraphs: [
          "Святкування почалося ще зранку: молодь прикрашала залу, сестри готували частування, а хор востаннє повторював нові пісні. До початку служіння зала була заповнена — прийшли не лише члени церкви, а й друзі, сусіди та гості з інших громад.",
          "Особливою частиною ранку стало **свідчення тих, хто прийшов до церкви цього року**. Їхні історії ще раз нагадали, заради чого ми існуємо: щоб кожна людина мала дім, де її приймуть і де вона зустріне Христа.",
        ],
      },
      {
        id: "b3",
        type: "verse",
        text: "Бо Я знаю ті думки, які думаю про вас, — говорить Господь, — думки миру, а не зла, щоб дати вам будучність та надію",
        reference: "Єремії 29:11",
      },
      { id: "b4", type: "heading", level: 2, text: "Рік, яким ми жили разом" },
      {
        id: "b5",
        type: "text",
        paragraphs: [
          "У проповіді пастор Микола говорив про вірність Бога в часи невизначеності. Попри війну, переїзди і втрати, громада не зменшилась — навпаки, у нас зʼявились нові служіння і нові люди.",
        ],
      },
      {
        id: "b6",
        type: "list",
        items: [
          "запустили підлітковий клуб *Connect* — щопʼятниці понад 30 підлітків;",
          "провели 4 табори для дітей і молоді;",
          "**12 людей** прийняли водне хрещення;",
          "волонтери передали понад 900 продуктових наборів родинам переселенців.",
        ],
      },
      {
        id: "b7",
        type: "gallery",
        images: [
          { src: url("news1"), alt: "Прославлення під час служіння" },
          { src: url("news2"), alt: "Молитва за церкву" },
          { src: url("news3"), alt: "Молодь після служіння" },
        ],
        caption: "Моменти святкового ранку",
      },
      {
        id: "b8",
        type: "quote",
        text: "Церква — це не будівля і не програма. Це люди, яких Бог зібрав разом, щоб вони любили одне одного і несли світло туди, де темно.",
        author: "Климчук Микола",
        role: "Старший пастор",
      },
      { id: "b9", type: "heading", level: 3, text: "Що далі" },
      {
        id: "b10",
        type: "text",
        paragraphs: [
          "Наступного року ми плануємо відкрити домашні групи в нових районах міста та розширити служіння для родин. Якщо хочете долучитися — [напишіть нам](/#contact) або підійдіть до служителів після богослужіння.",
        ],
      },
      {
        id: "b11",
        type: "video",
        // TODO: замінити на запис служіння церкви
        youtubeId: "jNQXAC9IVRw",
        poster: url("videoPoster"),
        title: "Запис святкового богослужіння",
        caption: "Повний запис богослужіння",
      },
      {
        id: "b12",
        type: "callout",
        title: "Долучайтеся до служінь",
        text: "Богослужіння щонеділі о **10:00**. Молодіжні зустрічі — щосуботи о 17:00. Адреса: м. Київ, вул. Прикладна, 1.",
      },
      { id: "b13", type: "divider" },
      {
        id: "b14",
        type: "text",
        paragraphs: [
          "Дякуємо кожному, хто служив, молився і просто був поруч цього року. Слава Богу за все, що Він зробив, — і за те, що ще зробить!",
        ],
      },
      { id: "b15", type: "button", text: "Я тут вперше", href: "/#services" },
    ],
  },
  {
    slug: "molytva-za-peresliduvanu-tserkvu",
    title: "Міжнародний день молитви за переслідувану церкву",
    tags: ["Події", "Церква", "Молитва"],
    publishedAt: new Date("2026-01-12T11:00:00+02:00"),
    cover: { src: url("news2"), alt: "Спільна молитва в церкві" },
    blocks: [
      {
        id: "b1",
        type: "lead",
        text: "Мільйони християн у світі не можуть вільно сповідувати свою віру. Цього дня ми молилися за них разом із церквами з різних країн.",
      },
      {
        id: "b2",
        type: "text",
        paragraphs: [
          "Протягом служіння ми чули історії братів і сестер, які залишаються вірними Христу попри загрози, вʼязниці й втрату роботи.",
        ],
      },
      {
        id: "b3",
        type: "image",
        image: { src: url("pastor"), alt: "Пастор під час проповіді" },
        caption: "Пастор Микола веде молитву",
        wide: true,
      },
      {
        id: "b4",
        type: "verse",
        text: "Коли страждає один член, то страждають усі члени",
        reference: "1 Коринтян 12:26",
      },
    ],
  },
  {
    slug: "connect-novyi-sezon",
    title: "Старт нового сезону підліткового клубу “Connect”",
    tags: ["Події", "Молодь"],
    publishedAt: new Date("2026-01-12T10:00:00+02:00"),
    cover: { src: url("news3"), alt: "Підлітки клубу Connect" },
    blocks: [
      {
        id: "b1",
        type: "lead",
        text: "Connect повертається! Щопʼятниці — ігри, розмови про життя і віру, піца та нові друзі.",
      },
      {
        id: "b2",
        type: "list",
        ordered: true,
        items: ["Приходь у пʼятницю о 18:00.", "Бери з собою друга.", "Решту ми організуємо 🙂"],
      },
      { id: "b3", type: "button", text: "Зареєструватися", href: "/#contact" },
    ],
  },
];

const main = async () => {
  await importDemoMedia();
  const ARTICLES = buildArticles();

  const author = await db.author.upsert({
    where: { id: "demo-pastor" },
    update: { photo: url("author") },
    create: { id: "demo-pastor", name: "Климчук Микола", role: "Старший пастор", photo: url("author") },
  });

  for (const a of ARTICLES) {
    // Та сама перевірка, що й при збереженні з адмінки
    const blocks = a.blocks.map((b) => articleBlockSchema.parse(b));
    const data = {
      title: a.title,
      status: "PUBLISHED" as const,
      publishedAt: a.publishedAt,
      tags: a.tags,
      coverSrc: a.cover.src,
      coverAlt: a.cover.alt,
      blocks,
      authorId: author.id,
    };
    await db.article.upsert({ where: { slug: a.slug }, update: data, create: { slug: a.slug, ...data } });
  }

  console.log(`Seed: ${Object.keys(DEMO_FILES).length} фото в медіатеці, автор, ${ARTICLES.length} статті`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
