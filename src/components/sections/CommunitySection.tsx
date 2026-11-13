import "./CommunitySection.scss";
import Rubricator from "../ui/Rubricator";
import visionIconAsset from "../../assets/icons/vision.svg";
import pathIconAsset from "../../assets/community/path.svg";
import growthIconAsset from "../../assets/community/growth.svg";
import callingIconAsset from "../../assets/community/calling.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const visionIcon = visionIconAsset.src;
const pathIcon = pathIconAsset.src;
const growthIcon = growthIconAsset.src;
const callingIcon = callingIconAsset.src;

// \n — перенос рядка як у макеті
const steps = [
  {
    icon: pathIcon,
    title: "Почати шлях\nіз Богом",
    text: "Покаяння і народження згори — момент, коли все починається заново.",
  },
  {
    icon: growthIcon,
    title: "Зростати\nдуховно",
    text: "Віра дорослішає не на самоті, а в спільноті, де тебе знають і підтримують.",
  },
  {
    icon: callingIcon,
    title: "Знайти своє\nпокликання",
    text: "Виявити дари, які дав Бог, і служити ними іншим людям.",
  },
];

const CommunitySection = () => {
  return (
    <section className="community" aria-labelledby="community-title">
      <div className="container">
        <div className="community__grid">
          <div className="community__intro">
            <Rubricator icon={visionIcon}>Наше бачення</Rubricator>
            <h2 id="community-title" className="section-title community__title">
              <span className="section-title__accent">Основа</span> нашої спільноти
            </h2>
            <p className="community__text">
              Ми віримо, що духовне життя має конкретні кроки. Ось на чому ми будуємо нашу
              спільноту.
            </p>
          </div>

          <ol className="community__steps">
            {steps.map((step, index) => (
              <li key={step.title} className="community__card">
                <span className="community__icon">
                  <img src={step.icon} width={26} height={26} alt="" />
                </span>
                <div className="community__card-body">
                  <span className="community__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="community__card-title">{step.title}</h3>
                  <p className="community__card-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
