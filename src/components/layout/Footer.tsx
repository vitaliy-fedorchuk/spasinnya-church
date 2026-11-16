import "./Footer.scss";
import { CHURCH_ADDRESS as ADDRESS, MAP_URL } from "../../constants";
import { getEventsSettings, getFooterSchedule } from "@/server/events";
import logoAsset from "../../assets/footer/logo.svg";
import lineScheduleAsset from "../../assets/footer/line-schedule.svg";
import lineBottomAsset from "../../assets/footer/line-bottom.svg";
import youtubeIconAsset from "../../assets/footer/youtube.svg";
import instagramIconAsset from "../../assets/footer/instagram.svg";
import facebookIconAsset from "../../assets/footer/facebook.svg";
import phoneIconAsset from "../../assets/footer/phone.svg";
import emailIconAsset from "../../assets/footer/email.svg";
import locationOutlineAsset from "../../assets/footer/location-outline.svg";
import locationPinAsset from "../../assets/footer/location-pin.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const logo = logoAsset.src;
const lineSchedule = lineScheduleAsset.src;
const lineBottom = lineBottomAsset.src;
const youtubeIcon = youtubeIconAsset.src;
const instagramIcon = instagramIconAsset.src;
const facebookIcon = facebookIconAsset.src;
const phoneIcon = phoneIconAsset.src;
const emailIcon = emailIconAsset.src;
const locationOutline = locationOutlineAsset.src;
const locationPin = locationPinAsset.src;

const PHONE = "+38 067 115 0033";
const EMAIL = "hello@spasinnya.church";

// Розклад — з подій (адмінка → «Події», позначка «у розкладі у футері»)

// TODO: замінити якорі на реальні id секцій
const navigation = [
  { label: "Про церкву", href: "/#about" },
  { label: "Служіння", href: "/#services" },
  { label: "Графік подій", href: "/#events" },
  { label: "Новини", href: "/blog" },
  { label: "Підтримати служіння", href: "/#contact" },
];

// Іконка локації складається з двох шарів (як у Figma)
const LocationIcon = () => (
  <span className="footer__icon footer__icon--location" aria-hidden="true">
    <img className="footer__icon-layer footer__icon-layer--location-pin" src={locationPin} alt="" />
    <img className="footer__icon-layer footer__icon-layer--location-outline" src={locationOutline} alt="" />
  </span>
);

const Footer = async () => {
  const [schedule, settings] = await Promise.all([getFooterSchedule(), getEventsSettings()]);

  return (
    <footer className="footer" data-surface="dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__about">
            <a href="/" className="footer__logo" aria-label="Церква Спасіння — на головну">
              <img src={logo} width={180} height={58} alt="" />
            </a>
            <p className="footer__description">
              Частина Української Церкви Християн Віри Євангельської (УЦХВЄ)
            </p>
            {/* TODO: вставити реальні посилання на соцмережі */}
            <ul className="footer__socials">
              <li>
                <a href="#" className="footer__social" aria-label="YouTube">
                  <img src={youtubeIcon} width={20} height={20} alt="" />
                </a>
              </li>
              <li>
                <a href="#" className="footer__social" aria-label="Instagram">
                  <img src={instagramIcon} width={20} height={20} alt="" />
                </a>
              </li>
              <li>
                <a href="#" className="footer__social" aria-label="Facebook">
                  <img src={facebookIcon} width={19} height={20} alt="" />
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__column">
            <h2 className="footer__heading">{settings.footerTitle}</h2>
            <ul className="footer__schedule">
              {schedule.map((item) => (
                <li key={item.id} className="footer__schedule-item">
                  <span className="footer__schedule-row">
                    <span>{item.day}</span>
                    <span className="footer__schedule-time">{item.time}</span>
                  </span>
                  <img className="footer__schedule-line" src={lineSchedule} width={315} height={1} alt="" />
                </li>
              ))}
            </ul>
          </div>

          <nav className="footer__column" aria-label="Навігація у футері">
            <h2 className="footer__heading">Навігація</h2>
            <ul className="footer__list">
              {navigation.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__column">
            <h2 className="footer__heading">Контакти</h2>
            <ul className="footer__list">
              <li>
                <a href={MAP_URL} className="footer__link footer__contact" target="_blank" rel="noreferrer">
                  <LocationIcon />
                  {ADDRESS}
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="footer__link footer__contact">
                  <span className="footer__icon footer__icon--phone" aria-hidden="true">
                    <img src={phoneIcon} width={16} height={16} alt="" />
                  </span>
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="footer__link footer__contact">
                  <span className="footer__icon footer__icon--email" aria-hidden="true">
                    <img className="footer__icon-layer footer__icon-layer--email" src={emailIcon} alt="" />
                  </span>
                  {EMAIL}
                </a>
              </li>
            </ul>

            <a
              href={MAP_URL}
              className="footer__map"
              target="_blank"
              rel="noreferrer"
              aria-label="Відкрити адресу на карті"
            >
              <LocationIcon />
            </a>
          </div>
        </div>

        <img className="footer__divider" src={lineBottom} width={1400} height={1} alt="" />

        <div className="footer__bottom">
          <p className="footer__small">ⓒ 2026 Церква Спасіння. Усі права захищені.</p>
          <p className="footer__small footer__small--center">Розробка - Федорчук Віталій</p>
          <a href="#" className="footer__small footer__small--right footer__link">
            Політика конфіденційності
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
