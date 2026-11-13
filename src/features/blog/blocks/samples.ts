import type { ArticleBlock, BlockType } from "../types";
// Фото для прикладів — із самого сайту (вбудовані в збірку, працюють будь-де)
import news1Asset from "../../../assets/news/news-1.webp";
import news2Asset from "../../../assets/news/news-2.webp";
import news3Asset from "../../../assets/news/news-3.webp";
import posterAsset from "../../../assets/about/video-poster.webp";

const news1 = news1Asset.src;
const news2 = news2Asset.src;
const news3 = news3Asset.src;
const poster = posterAsset.src;

/** Приклад кожного блоку — для вікна «Додати блок» і каталогу «Блоки» */
export const SAMPLE_BLOCKS: { [T in BlockType]: Extract<ArticleBlock, { type: T }> } = {
  lead: {
    id: "s-lead",
    type: "lead",
    text: "Цієї неділі ми зібралися всією церковною родиною, щоб подякувати Богові за ще один рік вірності.",
  },
  text: {
    id: "s-text",
    type: "text",
    paragraphs: [
      "Святкування почалося ще зранку: молодь прикрашала залу, а хор востаннє повторював нові пісні.",
      "Особливою частиною стало **свідчення тих, хто прийшов до церкви цього року** — [читати більше](#).",
    ],
  },
  heading: { id: "s-heading", type: "heading", level: 2, text: "Рік, яким ми жили разом" },
  list: {
    id: "s-list",
    type: "list",
    items: ["провели 4 табори для дітей і молоді;", "**12 людей** прийняли водне хрещення;", "відкрили підлітковий клуб."],
  },
  quote: {
    id: "s-quote",
    type: "quote",
    text: "Церква — це не будівля. Це люди, яких Бог зібрав разом, щоб вони любили одне одного.",
    author: "Климчук Микола",
    role: "Старший пастор",
  },
  verse: {
    id: "s-verse",
    type: "verse",
    text: "Бо Я знаю ті думки, які думаю про вас, — говорить Господь, — думки миру, а не зла",
    reference: "Єремії 29:11",
  },
  callout: {
    id: "s-callout",
    type: "callout",
    title: "Долучайтеся до служінь",
    text: "Богослужіння щонеділі о **10:00**. Молодіжні зустрічі — щосуботи о 17:00.",
  },
  image: {
    id: "s-image",
    type: "image",
    image: { src: news2, alt: "Молодіжне служіння" },
    caption: "Підпис під фото",
  },
  gallery: {
    id: "s-gallery",
    type: "gallery",
    images: [
      { src: news1, alt: "" },
      { src: news2, alt: "" },
      { src: news3, alt: "" },
    ],
    caption: "Моменти святкового ранку",
  },
  video: {
    id: "s-video",
    type: "video",
    youtubeId: "jNQXAC9IVRw",
    poster,
    title: "Приклад відео",
    caption: "Повний запис богослужіння",
  },
  button: { id: "s-button", type: "button", text: "Я тут вперше", href: "#" },
  divider: { id: "s-divider", type: "divider" },
};
