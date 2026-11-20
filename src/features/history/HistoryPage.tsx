import "@/components/buttons/BlackButton.scss";
import "@/features/blog/blocks/blocks.scss";
import "./HistoryPage.scss";
import type { CSSProperties, ReactNode } from "react";
import BlackButton from "@/components/buttons/BlackButton";
import Rubricator from "@/components/ui/Rubricator";
import { srcSetOf } from "@/features/media/urls";
import { ROUTE_URL } from "@/constants";
import { Dropcap } from "@/features/blog/blocks/TextBlocks";
import { Word } from "@/features/blog/blocks/AccentBlocks";
import ArticleLightbox from "@/features/blog/ArticleLightbox";
import { plural, type ChurchStats } from "@/features/church-stats/stats";
import historyIconAsset from "@/assets/icons/history.svg";
import calendarIconAsset from "@/assets/events/calendar.svg";
import bookIconAsset from "@/assets/news/book.svg";
import avatar2 from "@/assets/about/avatars/avatar-2.webp";
import avatar3 from "@/assets/about/avatars/avatar-3.webp";
import avatar4 from "@/assets/about/avatars/avatar-4.webp";
import avatar5 from "@/assets/about/avatars/avatar-5.webp";
import avatar6 from "@/assets/about/avatars/avatar-6.webp";
import avatar7 from "@/assets/about/avatars/avatar-7.webp";
import HistoryRail, { type Chapter } from "./HistoryRail";
import PhotoStack, { type StackPhoto } from "./PhotoStack";
import Stamp from "./Stamp";

const historyIcon = historyIconAsset.src;
const calendarIcon = calendarIconAsset.src;
const bookIcon = bookIconAsset.src;

const upload = (id: string) => `/uploads/2026/11/${id}-1600.webp`;

/** Фото будівництва (медіатека, альбом «Будівництво церкви») — по черзі, як будували */
const BUILD: StackPhoto[] = [
  { src: upload("mmwl0piar209f3b77d184"), alt: "Монтаж металевих арок даху" },
  { src: upload("mmwl0pdia79e794e8185f"), alt: "Початок робіт: земляні роботи на ділянці" },
  { src: upload("mmwl0peo929ab2a3b4526"), alt: "Будівельний майданчик: мурування фундаменту" },
  { src: upload("mmwl0pg0u574984c02c5c"), alt: "Брати мурують стіни" },
  { src: upload("mmwl0phalaf365b2f6089"), alt: "Монтаж арок даху — вигляд з дороги" },
  { src: upload("mmwl0pja9dec535c480d8"), alt: "Брати вкривають дах" },
  { src: upload("mmwl0pk5o7dc092d23322"), alt: "Зал дому молитви перед завершенням робіт" },
];

// Те саме фото арок, обрізане справа — щоб арка стояла по центру шапки
const HERO_PHOTO = upload("mmwl1mcm2e6ddb8f7f172");

// TODO: фото з посвячення (10–20) — замінити, коли будуть. Поки тимчасові з медіатеки
const OPENING: StackPhoto[] = [
  { src: "/uploads/2026/01/demo-news3-1600.webp", alt: "Посвячення дому молитви" },
  { src: "/uploads/2026/01/demo-church-1600.webp", alt: "Дім молитви" },
  { src: "/uploads/2026/01/demo-videoposter-1600.webp", alt: "Святкове зібрання" },
  { src: "/uploads/2026/01/demo-news1-1600.webp", alt: "Гості свята" },
  { src: "/uploads/2026/01/demo-news2-1600.webp", alt: "Молитва посвячення" },
  { src: "/uploads/2026/01/demo-event-youth-1600.webp", alt: "Хор на святі" },
  { src: upload("mmwl0pk5o7dc092d23322"), alt: "Зал дому молитви" },
];

const CHAPTERS: Chapter[] = [
  { id: "dumka", year: "2016", title: "Думка в молитві" },
  { id: "braty", year: "2016", title: "Сім братів" },
  { id: "blagoslovennya", year: "2016", title: "Чотири благословення" },
  { id: "budivnytstvo", year: "2016–2020", title: "Чотири роки будівництва" },
  { id: "vidkryttya", year: "2020", title: "Посвячення" },
  { id: "sluzhinnya", year: "2020+", title: "Що виросло" },
  { id: "sogodni", year: "Сьогодні", title: "Церква сьогодні" },
];

// TODO: фото братів. Поки — Микола Климчук і тимчасові обличчя
const BROTHERS = [
  {
    first: "Микола",
    last: "Климчук",
    note: "Ініціатор",
    lead: true,
    photo: "/uploads/2026/11/mmwl3pwg2c45f1549bfc2-1600.webp",
  },
  { first: "Михайло", last: "Климчук", note: "Ініціатор", lead: true, photo: avatar2.src },
  { first: "Олексій", last: "Денисюк", note: "Спонсор будівництва", photo: avatar3.src },
  { first: "Руслан", last: "Денисюк", note: "Спонсор будівництва", photo: avatar4.src },
  { first: "Анатолій", last: "Стельмашук", note: "Спонсор будівництва", photo: avatar5.src },
  { first: "Анатолій", last: "Якушевський", note: "Спонсор будівництва", photo: avatar6.src },
  { first: "Анатолій", last: "Макарусь", note: "Спонсор будівництва", photo: avatar7.src },
];

const BLESSINGS = [
  { who: "Старший пастор", where: "церкви Христа Спасителя" },
  { who: "Братерська рада", where: "одобрила" },
  { who: "Розширена братерська рада", where: "благословила" },
  { who: "Загальне членське зібрання", where: "церкви Христа Спасителя" },
];

const CHOIRS = [
  { when: "Спочатку", items: ["Єдиний хор"] },
  { when: "Згодом", items: ["Молодіжний", "Старший"] },
  { when: "Пізніше", items: ["Дитячий", "Підлітковий"], added: true },
];

/** Членів на посвяченні (2020) — для порівняння з сьогоднішнім числом */
const MEMBERS_2020 = 141;

// ---------- Іконки карток із числами — у стилі карток «Основа нашої спільноти» на головній ----------
const FactIcon = ({ children }: { children: ReactNode }) => (
  <span className="history-fact__icon" aria-hidden="true">
    {/* Лінійні, як іконки «Основа нашої спільноти» на головній: товста заокруглена лінія без заливки */}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  </span>
);

const ICON_CALENDAR = (
  <>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>
);
const ICON_BRICKS = (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M3 9.3h18M3 14.7h18M12 4v5.3M8 9.3v5.4M16 9.3v5.4M12 14.7V20" />
  </>
);
const ICON_PEOPLE = (
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2A6.5 6.5 0 0 1 21.5 20" />
  </>
);
const ICON_SPROUT = <path d="M12 21v-9m0 0C12 8 9 5 4 5c0 4.5 3 7 8 7Zm0-1.5c0-3.5 2.5-6 7-6 0 4-2.5 6-7 6" />;

interface Props {
  stats: ChurchStats;
}

const HistoryPage = ({ stats }: Props) => {
  const facts = [
    { value: "2016", label: "Рік заснування", icon: ICON_CALENDAR },
    { value: "4 роки", label: "Тривало будівництво", icon: ICON_BRICKS },
    {
      value: String(stats.members),
      label: `${plural(stats.members, "Член", "Члени", "Членів")} церкви сьогодні`,
      icon: ICON_PEOPLE,
    },
    { value: String(stats.teens + stats.youth), label: "Підлітків і молоді", icon: ICON_SPROUT },
  ].filter((f) => f.value !== "0");

  // Покоління — та сама шкала, що на сторінці «Служіння та проєкти» (клік — до служінь цього віку)
  const generations = [
    { id: "dity", label: "Діти", ages: "3–11 років", value: stats.children },
    { id: "pidlitky", label: "Підлітки", ages: "12–16 років", value: stats.teens },
    { id: "molod", label: "Молодь", ages: "16–30 років", value: stats.youth },
  ];

  return (
    <main className="history">
      <ArticleLightbox selector=".history [data-zoom]" />

      {/* ---------- Шапка ---------- */}
      <header className="history-hero page-hero" data-surface="dark">
        <img
          className="history-hero__bg page-hero__bg"
          src={HERO_PHOTO}
          srcSet={srcSetOf(HERO_PHOTO)}
          sizes="100vw"
          alt=""
        />
        <div className="container history-hero__inner" data-intro>
          <Rubricator icon={historyIcon} className="rubricator--light">
            Історія церкви
          </Rubricator>
          <h1 className="history-hero__title page-title">
            Думка, яку Бог <br className="history-br" />
            обіцяв благословити
          </h1>
          <p className="history-hero__lead">
            Як із молитви двох людей у 2016 році виросла церква «Спасіння» — з домом молитви, біблійним інститутом,
            чотирма хорами і громадою з {stats.members} {plural(stats.members, "члена", "членів", "членів")}.
          </p>
          <div className="history-hero__meta">
            <span>
              <img src={calendarIcon} alt="" />
              2016 — сьогодні
            </span>
            <span>
              <img src={bookIcon} alt="" />5 хв читання
            </span>
          </div>
        </div>
      </header>

      {/* ---------- Коротко ---------- */}
      <section className="container" aria-label="Коротко">
        <ul className="history-facts">
          {facts.map((f) => (
            <li key={f.label} className="history-fact">
              <FactIcon>{f.icon}</FactIcon>
              <span className="history-fact__body">
                <b>{f.value}</b>
                <span>{f.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="container history-body">
        <HistoryRail chapters={CHAPTERS} />

        <article className="history-article">
          <div className="history-lead">
            <Dropcap
              block={{
                id: "history-lead",
                type: "dropcap",
                text: "Церква «Спасіння» в селі Підгайці — дочірня церква церкви Христа Спасителя. Це молода громада, яка обʼєднала віруючих, що раніше належали до різних спільнот УЦХВЄ. А почалося все з однієї думки.",
              }}
            />
          </div>

          {/* ---------- 1. Думка ---------- */}
          <section className="history-chapter" id="dumka" aria-labelledby="dumka-title">
            <ChapterHead n={1} year="2016" id="dumka-title">
              Думка, що прийшла <span className="section-title__accent history-nowrap">в молитві</span>
            </ChapterHead>
            <p className="history-text">
              У 2016 році Миколі Олександровичу Климчуку і Михайлу Климчуку прийшла думка збудувати дім молитви. Вони
              почали разом молитися про це і взяли піст. Під час молитви прозвучало пророче слово:
            </p>
            <div className="history-block">
              <Word
                block={{
                  id: "history-word",
                  type: "word",
                  mark: "dove",
                  text: "Думка від Мене. Я благословлю, хоча буде не легко й не просто.",
                  caption: "Пророче слово · 2016",
                }}
              />
            </div>
            <p className="history-text">
              Справдилося і те, і інше: благословення — і те, що легко не буде. Попереду були роки праці.
            </p>
          </section>

          {/* ---------- 2. Брати ---------- */}
          <section className="history-chapter" id="braty" aria-labelledby="braty-title">
            <ChapterHead n={2} year="2016" id="braty-title">
              Сім братів, <span className="section-title__accent history-nowrap">одна думка</span>
            </ChapterHead>
            <p className="history-text">
              Микола Олександрович зібрав місцевих братів і розповів їм про ідею. Усі однодушно вирішили: варто починати
              будівництво. Саме ці чоловіки стали основними спонсорами будівництва церкви «Спасіння».
            </p>
            <ul className="history-people">
              {BROTHERS.map((b) => (
                <li key={b.first + b.last} className={`history-person${b.lead ? " history-person--lead" : ""}`}>
                  <img className="history-person__photo" src={b.photo} alt="" loading="lazy" />
                  <span className="history-person__name">
                    {b.first} {b.last}
                  </span>
                  <span className="history-person__note">{b.note}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- 3. Благословення ---------- */}
          <section className="history-chapter" id="blagoslovennya" aria-labelledby="blag-title">
            <ChapterHead n={3} year="2016" id="blag-title">
              Чотири <span className="section-title__accent">благословення</span>
            </ChapterHead>
            <p className="history-text">
              Більшість членів церкви Христа Спасителя мали допомагати в будівництві, тож брати спершу пішли до її
              старшого пастора. Рішення пройшло чотири кола — і на кожному отримало «так».
            </p>
            <ol className="history-steps">
              {BLESSINGS.map((s, i) => (
                <li key={s.who} className="history-step" style={{ "--i": i } as CSSProperties}>
                  <span className="history-step__num">0{i + 1}</span>
                  <b className="history-step__who">{s.who}</b>
                  <span className="history-step__where">{s.where}</span>
                  <span className="history-step__ok">
                    <svg className="history-check" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    Благословили
                  </span>
                </li>
              ))}
            </ol>
            <div className="history-doc">
              <div className="history-doc__text">
                <span className="history-doc__label">Офіційно</span>
                <p>
                  Релігійна громада церкви християн віри євангельської пʼятидесятників «Спасіння» зареєстрована
                  <br className="history-br" /> <b className="history-nowrap">17 березня 2016 року</b>.
                </p>
              </div>
              <Stamp />
            </div>
          </section>

          {/* ---------- 4. Будівництво ---------- */}
          <section className="history-chapter" id="budivnytstvo" aria-labelledby="bud-title">
            <ChapterHead n={4} year="2016–2020" id="bud-title">
              Чотири роки <span className="section-title__accent">будівництва</span>
            </ChapterHead>
            <p className="history-text">
              Невдовзі почалося будівництво. Брати одразу думали над проєктом так, щоб у домі молитви були класи для
              навчання — щоб церква була живою і практичною, а не лише залом для зібрань.
            </p>
            <p className="history-text">
              Коло тих, хто допомагав, весь час ширшало: до братів долучилася церква Христа Спасителя, потім сусідні
              церкви, а згодом відгукнулося багато людей з усієї області.
            </p>
            <div className="history-block">
              <PhotoStack photos={BUILD} />
            </div>
          </section>

          {/* ---------- 5. Посвячення ---------- */}
          <section className="history-chapter" id="vidkryttya" aria-labelledby="open-title">
            <ChapterHead n={5} year="22 листопада 2020" id="open-title">
              Посвячення <span className="section-title__accent">дому молитви</span>
            </ChapterHead>
            <p className="history-text">
              22 листопада 2020 року відбулося урочисте відкриття і посвячення Дому молитви. На свято прийшли не лише
              члени церкви «Спасіння», а й прихожани та служителі інших церков.
            </p>
            <dl className="history-numbers">
              <div>
                <dd>234</dd>
                <dt>людини в церкві у 2020</dt>
              </div>
              <div>
                <dd>{MEMBERS_2020}</dd>
                <dt>з них — офіційні члени</dt>
              </div>
            </dl>
            <div className="history-block">
              <PhotoStack photos={OPENING} visible={5} />
            </div>
          </section>

          {/* ---------- 6. Що виросло ---------- */}
          <section className="history-chapter" id="sluzhinnya" aria-labelledby="grow-title">
            <ChapterHead n={6} year="2020+" id="grow-title">
              Що виросло <span className="section-title__accent">за ці роки</span>
            </ChapterHead>
            <ul className="history-bento">
              <li className="history-ministry history-ministry--wide history-ministry--dark" data-surface="dark">
                <span className="history-ministry__badge">Вперше на Волині</span>
                <h3 className="history-ministry__title">Філіал Київського біблійного інституту</h3>
                <p className="history-ministry__text">
                  Уперше в історії Волинського братерства церков ХВЄ саме тут відкрився філіал КБІ. Щороку набираються
                  нові групи — люди мають можливість навчатися і глибше пізнавати Бога.
                </p>
              </li>
              <li className="history-ministry">
                <span className="history-ministry__since">З першого дня</span>
                <h3 className="history-ministry__title">Недільна школа</h3>
                <p className="history-ministry__text">Працює від заснування церкви і постійно зростає.</p>
              </li>
              <li className="history-ministry history-ministry--wide">
                <h3 className="history-ministry__title">Від одного хору — до чотирьох</h3>
                <ol className="history-choirs">
                  {CHOIRS.map((c) => (
                    <li key={c.when} className="history-choirs__stage">
                      <span className="history-choirs__when">{c.when}</span>
                      {c.items.map((it) => (
                        <span key={it} className={`history-choirs__pill${c.added ? " is-added" : ""}`}>
                          {c.added && "+ "}
                          {it}
                        </span>
                      ))}
                    </li>
                  ))}
                </ol>
              </li>
              <li className="history-ministry">
                <h3 className="history-ministry__title">Дошкільна студія</h3>
                <p className="history-ministry__text">
                  Її відвідують діти не лише прихожан, а й з невоцерковлених сімей.
                </p>
              </li>
              <li className="history-ministry">
                <h3 className="history-ministry__title">Жіноче служіння</h3>
                <p className="history-ministry__text">Підтримка, спілкування і спільна молитва.</p>
              </li>
              <li className="history-ministry">
                <h3 className="history-ministry__title">Соціальне служіння</h3>
                <p className="history-ministry__text">Допомога тим, хто її потребує, — у селі й поза ним.</p>
              </li>
              <li className="history-ministry">
                <h3 className="history-ministry__title">Церква онлайн</h3>
                <p className="history-ministry__text">
                  Богослужіння і проповіді на YouTube, новини в Instagram — для тих, хто не може прийти особисто.
                </p>
              </li>
            </ul>

            <div className="history-more">
              <BlackButton text="Усі служіння та проєкти" href="/sluzhinnya" />
            </div>
          </section>

          {/* ---------- 7. Сьогодні ---------- */}
          <section className="history-chapter" id="sogodni" aria-labelledby="today-title">
            <ChapterHead n={7} year={stats.asOf ? `Станом на ${stats.asOf}` : "Сьогодні"} id="today-title">
              Церква <span className="section-title__accent">сьогодні</span>
            </ChapterHead>
            <div className="history-today">
              <div className="history-stat history-stat--main">
                <span className="history-stat__from">{MEMBERS_2020} → </span>
                <b>{stats.members}</b>
                <span>
                  {plural(stats.members, "член", "члени", "членів")} церкви
                  {stats.members >= MEMBERS_2020 * 2 ? " — більш ніж удвічі більше, ніж у рік посвячення" : ""}
                </span>
              </div>
              <div className="history-team" data-surface="dark">
                <span className="history-team__label">Служителі</span>
                <div className="history-team__row">
                  <b>{stats.pastors}</b>
                  <span>{plural(stats.pastors, "пастор", "пастори", "пасторів")}</span>
                </div>
                <div className="history-team__row">
                  <b>{stats.deacons}</b>
                  <span>{plural(stats.deacons, "диякон", "диякони", "дияконів")}</span>
                </div>
              </div>
            </div>

            <h3 className="history-subhead">Покоління церкви</h3>
            <ol className="history-gens">
              {generations.map((g) => (
                <li key={g.id}>
                  <a className="history-gen" href={`/sluzhinnya#${g.id}`}>
                    <span className="history-gen__label">{g.label}</span>
                    <b className="history-gen__value">{g.value > 0 ? g.value : "—"}</b>
                    <span className="history-gen__ages">{g.ages}</span>
                    <span className="history-gen__link">Служіння для цього віку →</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </div>

      {/* ---------- Запрошення ---------- */}
      <section className="history-cta container" aria-labelledby="cta-title">
        <div className="history-cta__box" data-surface="dark">
          <h2 id="cta-title" className="history-cta__title">
            Історія триває — <br className="history-br" />і в ній є місце для вас
          </h2>
          <p className="history-cta__lead">Приходьте в неділю о 10:00 або 17:00. Будемо раді познайомитися.</p>
          <div className="history-cta__actions">
            <BlackButton text="Я тут вперше" href="/ya-tut-vpershe" bgColor="#90816A" svgColor="#90816A" />
            <BlackButton text="Прокласти маршрут" href={ROUTE_URL} external bgColor="rgba(255, 255, 255, 0.14)" />
          </div>
        </div>
      </section>
    </main>
  );
};

const ChapterHead = ({ n, year, id, children }: { n: number; year: string; id: string; children: ReactNode }) => (
  <header className="history-chapter__head">
    <span className="history-chapter__meta">
      Розділ {n} · {year}
    </span>
    <h2 id={id} className="section-title history-chapter__title">
      {children}
    </h2>
  </header>
);

export default HistoryPage;
