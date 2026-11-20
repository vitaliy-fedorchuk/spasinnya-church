import "./AboutSection.scss";
import { getChurchStats } from "@/server/church-stats";
import { plural } from "@/features/church-stats/stats";
import Rubricator from "../ui/Rubricator";
import infoIconAsset from "../../assets/icons/info.svg";
import videoPosterAsset from "../../assets/about/video-poster.webp";
import playIconAsset from "../../assets/about/play.svg";
import avatar1Asset from "../../assets/about/avatars/avatar-1.webp";
import avatar2Asset from "../../assets/about/avatars/avatar-2.webp";
import avatar3Asset from "../../assets/about/avatars/avatar-3.webp";
import avatar4Asset from "../../assets/about/avatars/avatar-4.webp";
import avatar5Asset from "../../assets/about/avatars/avatar-5.webp";
import avatar6Asset from "../../assets/about/avatars/avatar-6.webp";
import avatar7Asset from "../../assets/about/avatars/avatar-7.webp";
import avatar8Asset from "../../assets/about/avatars/avatar-8.webp";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const infoIcon = infoIconAsset.src;
const videoPoster = videoPosterAsset.src;
const playIcon = playIconAsset.src;
const avatar1 = avatar1Asset.src;
const avatar2 = avatar2Asset.src;
const avatar3 = avatar3Asset.src;
const avatar4 = avatar4Asset.src;
const avatar5 = avatar5Asset.src;
const avatar6 = avatar6Asset.src;
const avatar7 = avatar7Asset.src;
const avatar8 = avatar8Asset.src;

/** TODO: посилання на відео (mp4). Поки порожнє — кнопка Play лише декоративна. */
const VIDEO_URL = "";

// Фото вже обрізані квадратом по обличчю (кадр як у Figma), 160×160 або менше
const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

const AboutSection = async () => {
  // Число членів — з адмінки («Цифри»)
  const { members } = await getChurchStats();
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
              <span className="about__count-number">{members}</span>
              <span className="about__count-label">
                {plural(members, "член", "члени", "членів")}
                <br />
                церкви
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
