import type { CSSProperties } from "react";

import youthLogoAsset from "@/assets/ministries/youth-logo.svg";
import teensLogoAsset from "@/assets/ministries/teens-logo.svg";
import teensPhotoAsset from "@/assets/ministries/teens.webp";
import kidsLogoAsset from "@/assets/ministries/kids-logo.svg";
import kidsPhotoAsset from "@/assets/ministries/kids.webp";
import womenLogoAsset from "@/assets/ministries/women-logo.svg";
import timothyLogoAsset from "@/assets/ministries/timothy-logo.svg";
import youthPhotoAsset from "@/assets/events/youth.webp";
import worshipPhotoAsset from "@/assets/about/video-poster.webp";

/**
 * Служіння та проєкти церкви — картки на головній (стос, що наїжджає) і на сторінці /sluzhinnya.
 * TODO: перенести в адмінку.
 */

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const youthLogo = youthLogoAsset.src;
const teensLogo = teensLogoAsset.src;
const teensPhoto = teensPhotoAsset.src;
const kidsLogo = kidsLogoAsset.src;
const kidsPhoto = kidsPhotoAsset.src;
const womenLogo = womenLogoAsset.src;
const timothyLogo = timothyLogoAsset.src;
const youthPhoto = youthPhotoAsset.src;
const worshipPhoto = worshipPhotoAsset.src;

export interface Ministry {
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
export const MINISTRIES: Ministry[] = [
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
    photo: "/uploads/2026/11/mmwl73unx411acc5ff0da-1600.webp",
    logo: timothyLogo,
  },
  {
    title: "Творча студія «Спасіння»",
    tag: "4 роки",
    // TODO: розширити опис
    text: "Розвиваюча студія для найменших: творчість, гра та перші відкриття разом.",
    photo: "/uploads/2026/11/mmwl6mzyh09f9dda2f93c-1600.webp",
  },
  {
    title: "Дошкільна студія «Спасіння»",
    tag: "5 років",
    // TODO: розширити опис
    text: "Підготовка до школи для дітей 5 років у дружній та турботливій атмосфері.",
    photo: "/uploads/2026/11/mmwl6pt19703b7357cf29-1600.webp",
  },
];
