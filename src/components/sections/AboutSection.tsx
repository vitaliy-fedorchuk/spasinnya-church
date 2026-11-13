import "./AboutSection.scss";
import Rubricator from "../ui/Rubricator";
import infoIcon from "../../assets/icons/info.svg";
import videoPoster from "../../assets/about/video-poster.webp";
import playIcon from "../../assets/about/play.svg";
import avatar1 from "../../assets/about/avatars/avatar-1.webp";
import avatar2 from "../../assets/about/avatars/avatar-2.webp";
import avatar3 from "../../assets/about/avatars/avatar-3.webp";
import avatar4 from "../../assets/about/avatars/avatar-4.webp";
import avatar5 from "../../assets/about/avatars/avatar-5.webp";
import avatar6 from "../../assets/about/avatars/avatar-6.webp";
import avatar7 from "../../assets/about/avatars/avatar-7.webp";
import avatar8 from "../../assets/about/avatars/avatar-8.webp";

/** TODO: посилання на відео (mp4). Поки порожнє — кнопка Play лише декоративна. */
const VIDEO_URL = "";

const MEMBERS_COUNT = 312;

// Фото вже обрізані квадратом по обличчю (кадр як у Figma), 160×160 або менше
const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

const AboutSection = () => {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__header">
          <div className="about__intro">
            <Rubricator icon={infoIcon}>Про нас</Rubricator>
            <h2 id="about-title" className="section-title about__title">
              Хто ми і чим живе <br className="about__title-break" />
              <span className="section-title__accent">наша Церква</span> сьогодні
            </h2>
          </div>

          <div className="about__members">
            <ul className="about__avatars" aria-hidden="true">
              {avatars.map((avatar, index) => (
                <li key={index} className="about__avatar">
                  <span className="about__avatar-photo">
                    <img
                      className="about__avatar-img"
                      src={avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </li>
              ))}
            </ul>
            <p className="about__count">
              <span className="about__count-number">{MEMBERS_COUNT}</span>
              <span className="about__count-label">
                членів<br />церкви
              </span>
            </p>
          </div>
        </div>

        <div className="about__video" data-surface="dark">
          {VIDEO_URL ? (
            <video className="about__video-media" src={VIDEO_URL} poster={videoPoster} controls preload="none" />
          ) : (
            <>
              <img className="about__video-media" src={videoPoster} alt="Життя церкви" loading="lazy" />
              <span className="about__play" aria-hidden="true">
                <img className="about__play-icon" src={playIcon} alt="" />
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
