import "@/components/buttons/BlackButton.scss";
import "@/features/blog/blocks/blocks.scss";
import "./DonatePage.scss";
import type { ReactNode } from "react";
import BlackButton from "@/components/buttons/BlackButton";
import Rubricator from "@/components/ui/Rubricator";
import { Verse } from "@/features/blog/blocks/AccentBlocks";
import infoIconAsset from "@/assets/icons/info.svg";
import { DONATIONS, PRIVAT24_URL, QR_CODES, type DonationType } from "./data";

const infoIcon = infoIconAsset.src;
const HERO_PHOTO = "/uploads/2026/11/mmwmhlks13dce8aca7b02-1600.webp";

// Лінійні іконки — як «Основа нашої спільноти» на головній
const Line = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ICONS: Record<string, ReactNode> = {
  general: (
    <Line>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </Line>
  ),
  kids: (
    <Line>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2A6.5 6.5 0 0 1 21.5 20" />
    </Line>
  ),
  social: (
    <Line>
      <path d="M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
      <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L14.4 13" />
      <path d="m2 15 6 6" />
    </Line>
  ),
  building: (
    <Line>
      <path d="M3 21h18M5 21V10l7-6 7 6v11" />
      <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
    </Line>
  ),
};

const DonateButton = ({ d, light }: { d: DonationType; light?: boolean }) =>
  d.href ? (
    <BlackButton
      text="Пожертвувати"
      href={d.href}
      external
      bgColor={light ? "#90816A" : "#262626"}
      svgColor={light ? "#90816A" : "#262626"}
    />
  ) : (
    <span className={`donate-soon${light ? " donate-soon--light" : ""}`}>Оплата скоро</span>
  );

const DonatePage = () => {
  const [main, ...rest] = DONATIONS;

  return (
    <main className="donate">
      <header className="donate-hero page-hero" data-surface="dark">
        <img className="donate-hero__bg page-hero__bg" src={HERO_PHOTO} alt="" />
        <div className="container donate-hero__inner" data-intro>
          <Rubricator icon={infoIcon} className="rubricator--light">
            Підтримати
          </Rubricator>
          <h1 className="donate-hero__title page-title">Підтримати служіння</h1>
          <p className="donate-hero__lead">
            Кожна пожертва — це внесок у життя церкви: богослужіння, дітей і молодь, допомогу людям поруч. Дякуємо, що
            ви з нами.
          </p>
        </div>
      </header>

      <section className="container donate-section" aria-label="Напрями пожертв">
        {/* Головна — загальна пожертва */}
        <div className="donate-main" data-surface="dark">
          <span className="donate-main__icon">{ICONS[main.id]}</span>
          <div className="donate-main__body">
            <h2 className="donate-main__title">{main.title}</h2>
            <p className="donate-main__text">{main.text}</p>
          </div>
          <DonateButton d={main} light />
        </div>

        <h2 className="donate-subhead">Або оберіть напрям</h2>
        <ul className="donate-grid">
          {rest.map((d) => (
            <li key={d.id} className="donate-card">
              <span className="donate-card__icon">{ICONS[d.id]}</span>
              <h3 className="donate-card__title">{d.title}</h3>
              <p className="donate-card__text">{d.text}</p>
              <div className="donate-card__action">
                <DonateButton d={d} />
              </div>
            </li>
          ))}
        </ul>

        <h2 className="donate-subhead">Інші способи</h2>
        <div className="donate-other">
          {/* Приват24 */}
          <div className="donate-privat">
            <span className="donate-privat__label">Приват24</span>
            <p className="donate-privat__text">
              Якщо ви клієнт ПриватБанку — пожертвуйте прямо в застосунку чи на сайті Приват24.
            </p>
            <div className="donate-privat__action">
              {PRIVAT24_URL ? (
                <BlackButton text="Відкрити Приват24" href={PRIVAT24_URL} external />
              ) : (
                <span className="donate-soon">Посилання скоро</span>
              )}
            </div>
          </div>

          {/* QR-коди — навести камеру телефону */}
          <div className="donate-qr">
            <span className="donate-privat__label">Скануйте телефоном</span>
            <ul className="donate-qr__list">
              {QR_CODES.map((q) => (
                <li key={q.label} className="donate-qr__item">
                  <span className="donate-qr__code">
                    {q.src ? <img src={q.src} alt={`QR-код для пожертви через ${q.label}`} /> : <span>QR-код</span>}
                  </span>
                  <b>{q.label}</b>
                  <span className="donate-qr__hint">{q.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="donate-note">
          Оплата відбувається на сторінці LiqPay або в Приват24 — сайт не бачить і не зберігає даних вашої картки.
          Здійснюючи пожертву, ви погоджуєтеся з умовами <a href="/oferta">публічної оферти</a>.
        </p>

        <div className="donate-verse">
          <Verse
            block={{
              id: "donate-verse",
              type: "verse",
              text: "Нехай кожен дає, як серце йому призначає, не в смутку й не з примусу, бо Бог любить того, хто з радістю дає!",
              reference: "2 Коринтян 9:7",
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default DonatePage;
