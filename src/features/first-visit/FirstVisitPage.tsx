import "@/components/buttons/BlackButton.scss";
import "./FirstVisitPage.scss";
import type { ReactNode } from "react";
import BlackButton from "@/components/buttons/BlackButton";
import Rubricator from "@/components/ui/Rubricator";
import { srcSetOf } from "@/features/media/urls";
import { CHURCH_ADDRESS, ROUTE_URL } from "@/constants";
import medalIconAsset from "@/assets/welcome/medal.svg";
import infoIconAsset from "@/assets/icons/info.svg";
import questionIconAsset from "@/assets/icons/question.svg";
import visionIconAsset from "@/assets/icons/vision.svg";
import pastorPhotoAsset from "@/assets/welcome/pastor.webp";

const medalIcon = medalIconAsset.src;
const infoIcon = infoIconAsset.src;
const questionIcon = questionIconAsset.src;
const visionIcon = visionIconAsset.src;
const pastorPhoto = pastorPhotoAsset.src;

// Фото з медіатеки (варіанти 480–2400 вже нарізані)
const PHOTO = {
  hero: "/uploads/2026/01/demo-church-1600.webp",
  worship: "/uploads/2026/01/demo-news3-1600.webp",
  sermon: "/uploads/2026/01/demo-event-youth-1600.webp",
  prayer: "/uploads/2026/01/demo-news2-1600.webp",
  share: "/uploads/2026/01/demo-news1-1600.webp",
  together: "/uploads/2026/01/demo-videoposter-1600.webp",
};

/** Телефон церкви — той самий, що у футері */
const PHONE_HREF = "tel:+380671150033";

/** TODO: посилання на онлайн-трансляції (YouTube-канал) — як у WelcomeSection */
const ONLINE_URL = "";

// Кроки богослужіння — від початку до кінця
const STEPS = [
  {
    title: "Прославлення",
    text: "Ми збираємось разом і починаємо зібрання з прославлення Господа — піснями хвали й молитвою. Слова пісень на екрані, тож можна співати разом з усіма або просто слухати.",
    photo: PHOTO.worship,
  },
  {
    title: "Проповідь",
    text: "Важлива частина служіння — проповідь Божого Слова. Її мета — донести Євангеліє і показати, як біблійні істини можна втілювати в щоденному житті.",
    photo: PHOTO.sermon,
  },
  {
    title: "Молитва",
    text: "Усі частини служіння супроводжуються молитвою. Ми молимося за дітей і дорослих, за владу та мир в Україні, віддаючи все Богові з подякою і просячи Його керівництва.",
    photo: PHOTO.prayer,
  },
  {
    title: "Свідчення і таланти",
    text: "Дорослі й діти діляться талантами — піснею, віршем чи свідченням. Ті, у чиєму житті Бог особливо проявився, або хто потребує допомоги, можуть розповісти про це громаді.",
    photo: PHOTO.share,
  },
  {
    title: "Після служіння",
    text: "Не поспішайте йти: після богослужіння можна поспілкуватися зі служителями й іншими членами церкви, поставити запитання або попросити про молитву.",
    photo: PHOTO.together,
  },
];

// Іконки в стилі сайту (контур 1.8)
const Icon = ({ children }: { children: ReactNode }) => (
  <svg className="visit-icon" viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const SPECIAL = [
  {
    title: "Святкові богослужіння",
    text: "Особливо урочисто проходять великі християнські свята — Різдво Христове, Великдень, Свято Подяки (Жнив), а також Річниця церкви і День матері.",
    icon: (
      <Icon>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
  },
  {
    title: "Вечеря Господня",
    text: "Щомісяця першої неділі для членів церкви звершуємо Вечерю Господню, як заповів Ісус (Луки 22:19–20), — згадуючи Його страждання, смерть і ціну, заплачену за наші гріхи.",
    icon: (
      <Icon>
        <path d="M8 22h8M12 15v7M7 3h10l-1 7a4 4 0 0 1-8 0L7 3Z" />
      </Icon>
    ),
  },
  {
    title: "Водне хрещення",
    text: "Урочиста подія, коли люди, що увірували в Ісуса Христа, приймають хрещення через повне занурення — свідчать про віру і рішення присвятити життя Господу.",
    icon: (
      <Icon>
        <path d="M12 2.7C9 6.4 6 9.6 6 13a6 6 0 0 0 12 0c0-3.4-3-6.6-6-10.3Z" />
      </Icon>
    ),
  },
];

const PRACTICAL = [
  {
    title: "Нічого готувати не треба",
    text: "Не потрібно нічого знати заздалегідь. Просто приходьте — вас зустрінуть і допоможуть зорієнтуватися.",
    icon: (
      <Icon>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
      </Icon>
    ),
  },
  {
    title: "Одяг — як вам зручно",
    text: "Спеціального дрес-коду немає. Приходьте в охайному і зручному для вас одязі.",
    icon: (
      <Icon>
        <path d="M20.4 6.6 16 4a4 4 0 0 1-8 0L3.6 6.6a1 1 0 0 0-.4 1.3l1.6 3a1 1 0 0 0 1.2.5L8 10.6V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-9.4l2 .8a1 1 0 0 0 1.2-.5l1.6-3a1 1 0 0 0-.4-1.3Z" />
      </Icon>
    ),
  },
  {
    title: "Діти — разом із вами",
    text: "Діти можуть бути з батьками на богослужінні. Для них також діють Дитяча школа і творчі студії.",
    icon: (
      <Icon>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a3 3 0 0 1 0 5.8M21 21v-2a4 4 0 0 0-3-3.9" />
      </Icon>
    ),
  },
  {
    title: "Можна й онлайн",
    text: "Недільні богослужіння транслюємо онлайн — можна спершу подивитися, як усе проходить.",
    icon: (
      <Icon>
        <rect width="20" height="14" x="2" y="4" rx="2" />
        <path d="m10 8.5 4 2.5-4 2.5v-5ZM8 21h8" />
      </Icon>
    ),
  },
];

interface Props {
  schedule: { day: string; items: { time: string; label: string }[] }[];
}

const FirstVisitPage = ({ schedule }: Props) => {
  const sunday = schedule.find((d) => d.day === "Неділя");

  return (
    <main className="visit">
      {/* ---------- Шапка ---------- */}
      <header className="visit-hero page-hero" data-surface="dark">
        <img className="visit-hero__bg page-hero__bg" src={PHOTO.hero} srcSet={srcSetOf(PHOTO.hero)} sizes="100vw" alt="" />
        <div className="container visit-hero__inner" data-intro>
          <Rubricator icon={medalIcon} className="rubricator--light">
            Я тут вперше
          </Rubricator>
          <h1 className="visit-hero__title page-title">Давайте знайомитись</h1>
          <p className="visit-hero__lead">
            Ми розуміємо, що прийти вперше — це крок. Тут вам будуть раді: розповімо, як проходить богослужіння, що
            варто знати і як нас знайти.
          </p>

          <div className="visit-hero__facts">
            {sunday && (
              <div className="visit-hero__fact">
                <Icon>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </Icon>
                <span>
                  <b>Щонеділі</b>
                  {sunday.items.map((i) => i.time).join(" і ")}
                </span>
              </div>
            )}
            <a className="visit-hero__fact" href={ROUTE_URL} target="_blank" rel="noreferrer">
              <Icon>
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </Icon>
              <span>
                <b>Адреса</b>
                {CHURCH_ADDRESS}
              </span>
            </a>
          </div>

          <div className="visit-hero__actions">
            <BlackButton text="Прокласти маршрут" href={ROUTE_URL} external bgColor="#90816A" svgColor="#90816A" />
            <BlackButton
              text="Як проходить служіння"
              href="#service"
              bgColor="rgba(255, 255, 255, 0.14)"
              circleColor="#ffffff"
            />
          </div>
        </div>
      </header>

      {/* ---------- Як проходить богослужіння ---------- */}
      <section className="visit-section container" id="service" aria-labelledby="service-title">
        <header className="visit-head">
          <Rubricator icon={infoIcon}>Богослужіння</Rubricator>
          <h2 id="service-title" className="section-title">
            Як проходить <span className="section-title__accent">богослужіння</span>
          </h2>
          <p className="visit-head__text">
            Від першої пісні до розмов після служіння — ось що на вас чекає в неділю.
          </p>
        </header>

        <ol className="visit-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="visit-step">
              <img
                className="visit-step__photo"
                src={s.photo}
                srcSet={srcSetOf(s.photo)}
                sizes="(max-width: 767px) 92vw, 640px"
                alt=""
                loading="lazy"
              />
              <div className="visit-step__body">
                <span className="visit-step__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="visit-step__title">{s.title}</h3>
                <p className="visit-step__text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Особливі служіння ---------- */}
      <section className="visit-special" data-surface="dark" aria-labelledby="special-title">
        <div className="container">
          <header className="visit-head visit-head--light">
            <Rubricator icon={visionIcon} className="rubricator--light">
              Особливі події
            </Rubricator>
            <h2 id="special-title" className="section-title">
              Особливі <span className="section-title__accent">служіння</span>
            </h2>
          </header>
          <ul className="visit-cards">
            {SPECIAL.map((c) => (
              <li key={c.title} className="visit-card visit-card--dark">
                <span className="visit-card__icon">{c.icon}</span>
                <h3 className="visit-card__title">{c.title}</h3>
                <p className="visit-card__text">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Що варто знати + розклад ---------- */}
      <section className="visit-section container" aria-labelledby="know-title">
        <header className="visit-head">
          <Rubricator icon={questionIcon}>Перший візит</Rubricator>
          <h2 id="know-title" className="section-title">
            Що варто знати <span className="section-title__accent">перед першим візитом</span>
          </h2>
        </header>

        <div className="visit-know">
          <ul className="visit-cards visit-cards--2">
            {PRACTICAL.map((c) => (
              <li key={c.title} className="visit-card">
                <span className="visit-card__icon">{c.icon}</span>
                <h3 className="visit-card__title">{c.title}</h3>
                <p className="visit-card__text">{c.text}</p>
                {c.title === "Можна й онлайн" && ONLINE_URL && (
                  <a className="visit-card__link" href={ONLINE_URL} target="_blank" rel="noreferrer">
                    Дивитись онлайн
                  </a>
                )}
              </li>
            ))}
          </ul>

          <aside className="visit-schedule" aria-label="Розклад зустрічей">
            <h3 className="visit-schedule__title">Розклад зустрічей</h3>
            <dl className="visit-schedule__list">
              {schedule.map((d) => (
                <div key={d.day} className="visit-schedule__day">
                  <dt>{d.day}</dt>
                  {d.items.map((i) => (
                    <dd key={i.time + i.label}>
                      <span>{i.label}</span>
                      <b>{i.time}</b>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <a className="visit-schedule__place" href={ROUTE_URL} target="_blank" rel="noreferrer">
              <Icon>
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </Icon>
              <span>
                {CHURCH_ADDRESS}
                <small>Прокласти маршрут →</small>
              </span>
            </a>
          </aside>
        </div>
      </section>

      {/* ---------- Запрошення ---------- */}
      <section className="visit-cta container" aria-labelledby="cta-title">
        <div className="visit-cta__box" data-surface="dark">
          <div className="visit-cta__text">
            <h2 id="cta-title" className="visit-cta__title">
              Приєднуйтеся до нас, щоб разом поклонятися великому Богові!
            </h2>
            <p className="visit-cta__lead">
              Маєте запитання перед першим візитом? Напишіть або подзвоніть — пастор і служителі охоче відповідять.
            </p>
            <div className="visit-hero__actions visit-cta__actions">
              <BlackButton text="Прокласти маршрут" href={ROUTE_URL} external bgColor="#90816A" svgColor="#90816A" />
              <BlackButton
                text="Подзвонити нам"
                href={PHONE_HREF}
                bgColor="rgba(255, 255, 255, 0.14)"
                icon={
                  <Icon>
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                  </Icon>
                }
              />
            </div>
          </div>
          <figure className="visit-cta__pastor">
            <img src={pastorPhoto} alt="Климчук Микола Олександрович" loading="lazy" />
            <figcaption>
              <b>Климчук Микола</b>
              Старший пастор — чекаємо на вас!
            </figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
};

export default FirstVisitPage;
