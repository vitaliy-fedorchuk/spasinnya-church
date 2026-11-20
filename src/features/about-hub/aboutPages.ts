/**
 * Сторінки розділу «Про нас». Без href — сторінки ще немає (на хабі: «Скоро»).
 * Тимчасові фото з медіатеки — замінити на справжні.
 */
export interface AboutPage {
  title: string;
  text: string;
  href?: string;
  photo: string;
}

export const ABOUT_PAGES: AboutPage[] = [
  {
    title: "Стрічка подій",
    text: "Найближчі зібрання, свята й події церкви — що, коли і де.",
    // Рубрика «Події» в «Часописі новин»
    href: `/blog?tag=${encodeURIComponent("Події")}#archive`,
    photo: "/uploads/2026/11/mmwl7a2aade55ea2e717f-1600.webp",
  },
  {
    title: "Коло віровчення",
    text: "У що ми віримо: основи віри, на яких стоїть наша церква.",
    photo: "/uploads/2026/01/demo-news3-1600.webp",
  },
  {
    title: "Ми цінуємо",
    text: "Цінності, якими ми живемо щодня — в церкві й поза нею.",
    photo: "/uploads/2026/01/demo-news1-1600.webp",
  },
  {
    title: "Історія церкви",
    text: "Як із молитви двох людей у 2016 році виросла церква «Спасіння».",
    href: "/istoriya",
    photo: "/uploads/2026/11/mmwl0phalaf365b2f6089-1600.webp",
  },
  {
    title: "Бачення церкви",
    text: "Куди ми рухаємося і до чого прагнемо як громада.",
    photo: "/uploads/2026/01/demo-videoposter-1600.webp",
  },
  {
    title: "Напрямки служінь",
    text: "Діти, підлітки, молодь, музика, жіноче й соціальне служіння.",
    href: "/sluzhinnya",
    photo: "/uploads/2026/11/mmwl73unx411acc5ff0da-1600.webp",
  },
  {
    title: "Церковне керівництво",
    text: "Пастор, диякони і служителі, які опікуються церквою.",
    photo: "/uploads/2026/01/demo-pastor-1600.webp",
  },
];
