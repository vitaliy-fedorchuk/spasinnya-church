import "@/components/buttons/BlackButton.scss";
import "./ContactsPage.scss";
import BlackButton from "@/components/buttons/BlackButton";
import Rubricator from "@/components/ui/Rubricator";
import { srcSetOf } from "@/features/media/urls";
import { CHURCH_ADDRESS, CHURCH_EMAIL, ROUTE_URL, SOCIAL_LINKS } from "@/constants";
import { ARROW_PATH } from "@/components/buttons/arrowPath";
import youtubeIconAsset from "@/assets/footer/youtube.svg";
import instagramIconAsset from "@/assets/footer/instagram.svg";
import facebookIconAsset from "@/assets/footer/facebook.svg";
import infoIconAsset from "@/assets/icons/info.svg";
import CopyEmail from "./CopyEmail";

const infoIcon = infoIconAsset.src;

// Соцмережі — посилання в constants (SOCIAL_LINKS), ті самі, що у футері
const SOCIALS = [
  { name: "YouTube", text: "Записи богослужінь і проповідей", href: SOCIAL_LINKS.youtube, icon: youtubeIconAsset.src },
  {
    name: "Instagram",
    text: "Фото, новини і життя церкви",
    href: SOCIAL_LINKS.instagram,
    icon: instagramIconAsset.src,
  },
  { name: "Facebook", text: "Події та оголошення", href: SOCIAL_LINKS.facebook, icon: facebookIconAsset.src },
];
const HERO_PHOTO = "/uploads/2026/11/mmwl8441bd1dac7e419d9-1600.webp";

interface Props {
  schedule: { day: string; items: { time: string; label: string }[] }[];
}

const Icon = ({ d }: { d: string }) => (
  <svg className="contacts-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const MAIL = "M4 6h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Zm0 1 8 6 8-6";
const PIN = "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";

const ContactsPage = ({ schedule }: Props) => {
  const sunday = schedule.find((d) => d.day === "Неділя");

  return (
    <main className="contacts">
      <header className="contacts-hero page-hero" data-surface="dark">
        <img
          className="contacts-hero__bg page-hero__bg"
          src={HERO_PHOTO}
          srcSet={srcSetOf(HERO_PHOTO)}
          sizes="100vw"
          alt=""
        />
        <div className="container contacts-hero__inner" data-intro>
          <Rubricator icon={infoIcon} className="rubricator--light">
            Контакти
          </Rubricator>
          <h1 className="contacts-hero__title page-title">Напишіть нам</h1>
          <p className="contacts-hero__lead">
            Маєте запитання про церкву, служіння чи перший візит? Або хочете, щоб ми помолилися за вас? Будемо раді
            вашому листу.
          </p>
        </div>
      </header>

      <section className="container contacts-section" aria-label="Як звʼязатися">
        <div className="contacts-grid">
          {/* Пошта — головне */}
          <div className="contacts-mail" data-surface="dark">
            <span className="contacts-mail__label">
              <Icon d={MAIL} />
              Електронна пошта
            </span>
            <a className="contacts-mail__address" href={`mailto:${CHURCH_EMAIL}`}>
              {/* Переносимо лише перед «@», не посеред слова */}
              {CHURCH_EMAIL.split("@")[0]}
              <wbr />@{CHURCH_EMAIL.split("@")[1]}
            </a>
            <div className="contacts-mail__actions">
              <BlackButton text="Написати листа" href={`mailto:${CHURCH_EMAIL}`} bgColor="#90816A" svgColor="#90816A" />
              <CopyEmail email={CHURCH_EMAIL} />
            </div>
          </div>

          {/* Де і коли — щоб прийти особисто */}
          <div className="contacts-visit">
            <span className="contacts-visit__label">
              <Icon d={PIN} />
              Приходьте особисто
            </span>
            {/* «с.» і «1 В» не відриваються від сусіднього слова */}
            <p className="contacts-visit__address">{CHURCH_ADDRESS.replace(/(с\.|1) /g, "$1\u00a0")}</p>
            {sunday && (
              <p className="contacts-visit__time">
                Щонеділі · <b>{sunday.items.map((i) => i.time).join(" і ")}</b>
              </p>
            )}
            <div className="contacts-visit__links">
              <a href={ROUTE_URL} target="_blank" rel="noreferrer">
                Прокласти маршрут →
              </a>
              <a href="/ya-tut-vpershe">Я тут вперше →</a>
            </div>
          </div>
        </div>

        <h2 className="contacts-subhead">Ми в соцмережах</h2>
        <ul className="contacts-socials">
          {SOCIALS.map((s) => (
            <li key={s.name}>
              <a className="contacts-social" href={s.href || "#"} target="_blank" rel="noreferrer">
                <span className="contacts-social__icon">
                  <img src={s.icon} alt="" />
                </span>
                <span className="contacts-social__body">
                  <b>{s.name}</b>
                  <span>{s.text}</span>
                </span>
                <span className="contacts-social__arrow" aria-hidden="true">
                  <svg viewBox="0 0 22 22">
                    <path d={ARROW_PATH} />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default ContactsPage;
