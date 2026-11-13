import "./WelcomeSection.scss";
import Rubricator from "../ui/Rubricator";
import BlackButton from "../buttons/BlackButton";
import { ROUTE_URL } from "../../constants";
import medalIconAsset from "../../assets/welcome/medal.svg";
import pastorPhotoAsset from "../../assets/welcome/pastor.webp";
import locationPinAsset from "../../assets/welcome/location-pin.svg";
import locationOutlineAsset from "../../assets/welcome/location-outline.svg";
import playIconAsset from "../../assets/welcome/play.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const medalIcon = medalIconAsset.src;
const pastorPhoto = pastorPhotoAsset.src;
const locationPin = locationPinAsset.src;
const locationOutline = locationOutlineAsset.src;
const playIcon = playIconAsset.src;

/** TODO: посилання на онлайн-трансляції (YouTube-канал) */
const ONLINE_URL = "#";

// Іконка локації з двох шарів, як у Figma
const LocationIcon = () => (
  <span className="welcome__icon welcome__icon--location" aria-hidden="true">
    <img className="welcome__icon-pin" src={locationPin} alt="" />
    <img className="welcome__icon-outline" src={locationOutline} alt="" />
  </span>
);

const WelcomeSection = () => {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__box" data-surface="dark">
        <div className="container welcome__inner">
          <div className="welcome__content">
            <Rubricator icon={medalIcon} className="rubricator--light">
              Ласкаво просимо
            </Rubricator>
            <h2 id="welcome-title" className="section-title welcome__title">
              Перший раз? <br />
              Приходьте — ми вас чекаємо!
            </h2>
            <p className="welcome__text">
              Ми розуміємо, що прийти вперше — це крок. Не потрібно нічого знати заздалегідь і
              нічого готувати. Просто приходьте — тут вам будуть раді, ніхто не чекає від вас
              нічого зайвого.
            </p>
            <div className="welcome__actions">
              <BlackButton
                text="Прокласти маршрут"
                href={ROUTE_URL}
                external
                circleColor="#464646"
                icon={<LocationIcon />}
              />
              <BlackButton
                text="Дивитись онлайн"
                href={ONLINE_URL}
                external
                circleColor="#464646"
                icon={<img className="welcome__icon" src={playIcon} alt="" aria-hidden="true" />}
              />
            </div>
          </div>

          <figure className="welcome__pastor">
            <img className="welcome__pastor-photo" src={pastorPhoto} alt="Климчук Микола Олександрович" loading="lazy" />
            <figcaption className="welcome__card">
              <span className="welcome__card-name">Климчук Микола Олександрович</span>
              <span className="welcome__card-role">Старший пастор Церкви Спасіння</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
