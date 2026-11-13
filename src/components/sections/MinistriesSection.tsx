"use client";

import { useRef, type CSSProperties } from "react";
import "./MinistriesSection.scss";
import Rubricator from "../ui/Rubricator";
import { useStackedCards } from "../../hooks/useStackedCards";
import archeryIconAsset from "../../assets/icons/archery.svg";
import youthLogoAsset from "../../assets/ministries/youth-logo.svg";
import teensLogoAsset from "../../assets/ministries/teens-logo.svg";
import teensPhotoAsset from "../../assets/ministries/teens.webp";
import kidsLogoAsset from "../../assets/ministries/kids-logo.svg";
import kidsPhotoAsset from "../../assets/ministries/kids.webp";
import womenLogoAsset from "../../assets/ministries/women-logo.svg";
import timothyLogoAsset from "../../assets/ministries/timothy-logo.svg";
import timothyPhotoAsset from "../../assets/ministries/timothy.webp";
import youthPhotoAsset from "../../assets/events/youth.webp";
import worshipPhotoAsset from "../../assets/about/video-poster.webp";
import churchPhotoAsset from "../../public/images/hero-fon.webp";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const archeryIcon = archeryIconAsset.src;
const youthLogo = youthLogoAsset.src;
const teensLogo = teensLogoAsset.src;
const teensPhoto = teensPhotoAsset.src;
const kidsLogo = kidsLogoAsset.src;
const kidsPhoto = kidsPhotoAsset.src;
const womenLogo = womenLogoAsset.src;
const timothyLogo = timothyLogoAsset.src;
const timothyPhoto = timothyPhotoAsset.src;
const youthPhoto = youthPhotoAsset.src;
const worshipPhoto = worshipPhotoAsset.src;
const churchPhoto = churchPhotoAsset.src;

interface Ministry {
  title: string;
  /** Білий бейдж над назвою (вік або для кого) */
  tag: string;
  text: string;
  photo: string;
  /** Кадрування фото, якщо воно не просто «на всю картку» (як у Figma) */
  photoStyle?: CSSProperties;
  /** Логотип служіння в лівому верхньому куті (необов'язково) */
  logo?: string;
  /** Логотип темний — на картці перефарбувати в білий */
  logoInverted?: boolean;
}

/**
 * Порядок карток — як тут у масиві.
 * TODO: фото (крім молодіжного) і тексти, позначені нижче, — тимчасові.
 */
const ministries: Ministry[] = [
  {
    title: "Дитяча школа",
    tag: "3 - 11 років",
    // TODO: справжній опис
    text: "Біблійні історії, творчість та ігри для дітей у турботливій атмосфері.",
    photo: kidsPhoto,
    logo: kidsLogo,
  },
  {
    title: "Підлітковий клуб",
    tag: "12 - 15 років",
    // TODO: справжній опис
    text: "Зустрічі для підлітків: спілкування, ігри, запитання про віру і час разом із друзями.",
    photo: teensPhoto,
    logo: teensLogo,
  },
  {
    title: "Молодіжне служіння",
    tag: "16 - 30 років",
    text: "Spasinnya Youth – це зустрічі для поглибленого пізнання Бога, пошуку друзів, реалізації та спільного розвитку.",
    photo: youthPhoto,
    // Кадр із Figma: фото збільшене на 24% і притиснуте до лівого краю
    photoStyle: { width: "124.02%", height: "124.04%", left: 0, top: "-14.46%" },
    logo: youthLogo,
  },
  {
    title: "Жіноче служіння",
    tag: "Для жінок",
    // TODO: справжній опис
    text: "Зустрічі для жінок: молитва, підтримка, спілкування і зростання у вірі разом.",
    photo: worshipPhoto,
    logo: womenLogo,
    logoInverted: true,
  },
  {
    title: "Підлітковий коледж «Тимофій»",
    tag: "14 - 16 років",
    // TODO: справжній опис
    text: "Навчання для підлітків, які хочуть глибше пізнати Біблію та зростати у служінні.",
    photo: timothyPhoto,
    logo: timothyLogo,
  },
  {
    title: "Творча студія «Спасіння»",
    tag: "4 роки",
    // TODO: розширити опис
    text: "Розвиваюча студія для найменших: творчість, гра та перші відкриття разом.",
    photo: churchPhoto,
  },
  {
    title: "Дошкільна студія «Спасіння»",
    tag: "5 років",
    // TODO: розширити опис
    text: "Підготовка до школи для дітей 5 років у дружній та турботливій атмосфері.",
    photo: churchPhoto,
  },
];

const MinistriesSection = () => {
  const listRef = useRef<HTMLUListElement>(null);
  useStackedCards(listRef);

  return (
    <section className="ministries" aria-labelledby="ministries-title">
      <div className="container ministries__grid">
        {/* Права частина (у розмітці перша — щоб на телефоні була зверху) */}
        <div className="ministries__intro">
          <div className="ministries__intro-inner">
            <Rubricator icon={archeryIcon}>Діяльність</Rubricator>
            <h2 id="ministries-title" className="section-title ministries__title">
              Служіння та проєкти <span className="section-title__accent">Церкви</span>
            </h2>
            <p className="ministries__text">
              Ми віримо, що кожна людина має дар і покликання. Наші служіння — це місця, де ці дари
              знаходять застосування і приносять плід.
            </p>
          </div>
        </div>

        {/* Ліва частина: картки, що наїжджають одна на одну */}
        <ul ref={listRef} className="ministries__cards">
          {ministries.map((item, index) => (
            <li
              key={item.title}
              className="ministries__card"
              data-surface="dark"
              style={{ "--index": index } as CSSProperties}
            >
              <img
                className="ministries__photo"
                src={item.photo}
                style={item.photoStyle}
                alt=""
                loading="lazy"
              />
              {item.logo && (
                <img
                  className={`ministries__logo${item.logoInverted ? " ministries__logo--inverted" : ""}`}
                  src={item.logo}
                  alt=""
                />
              )}
              <div className="ministries__body">
                <span className="ministries__tag">{item.tag}</span>
                <h3 className="ministries__card-title">{item.title}</h3>
                <p className="ministries__card-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default MinistriesSection;
