import type { BlockType } from "../types";

/**
 * Каталог блоків для адмінки: групи (у меню «Додати блок») і пояснення.
 * Новий вид блоку додається в одну з груп і в BLOCK_INFO — TypeScript підкаже.
 */
export const BLOCK_GROUPS = [
  { id: "text", label: "Текст", types: ["lead", "text", "heading", "list"] },
  { id: "accent", label: "Акценти", types: ["quote", "verse", "callout"] },
  { id: "photo", label: "Фото", types: ["image", "gallery"] },
  { id: "video", label: "Відео", types: ["video"] },
  { id: "other", label: "Інше", types: ["button", "divider"] },
] as const satisfies readonly { id: string; label: string; types: readonly BlockType[] }[];

// Кожен вид блоку має бути в якійсь групі (інакше тут помилка типів)
type Grouped = (typeof BLOCK_GROUPS)[number]["types"][number];
const everyTypeGrouped: [Exclude<BlockType, Grouped>] extends [never] ? true : false = true;
void everyTypeGrouped;

export const BLOCK_INFO: Record<BlockType, { hint: string; when: string }> = {
  lead: {
    hint: "Збільшений перший абзац",
    when: "На самому початку статті: 1–2 речення, що коротко кажуть, про що вона.",
  },
  text: {
    hint: "Один або кілька абзаців",
    when: "Основний текст. Абзаци розділяйте порожнім рядком; можна жирний, курсив і посилання.",
  },
  heading: {
    hint: "Підзаголовок розділу",
    when: "Коли стаття довга — щоб поділити її на частини. «Розділ» більший, «підрозділ» менший.",
  },
  list: {
    hint: "Пункти з крапками або номерами",
    when: "Перелік: що було, що взяти з собою, кроки реєстрації (нумерований).",
  },
  quote: {
    hint: "Слова людини з підписом",
    when: "Пряма мова: слова пастора, свідчення, відгук. Автора й посаду можна не вказувати.",
  },
  verse: {
    hint: "Біблійний вірш — темний акцентний блок",
    when: "Ключовий вірш статті. Найпомітніший блок — краще один на статтю.",
  },
  callout: {
    hint: "Виділена примітка: розклад, адреса",
    when: "Практична інформація, яку не можна пропустити: час, місце, як долучитися.",
  },
  image: {
    hint: "Одне фото з підписом",
    when: "Окреме фото посеред тексту. «Ширше за текст» — для особливо гарних кадрів.",
  },
  gallery: {
    hint: "2–4 фото поряд",
    when: "Кілька фото з події. На телефоні гортаються вбік.",
  },
  video: {
    hint: "Відео з YouTube",
    when: "Запис служіння чи відео з події. Плеєр вантажиться лише після кліку — сторінка не гальмує.",
  },
  button: {
    hint: "Кнопка-заклик",
    when: "Дія для читача: зареєструватися, написати, підтримати. Краще одна наприкінці.",
  },
  divider: {
    hint: "Три крапки між частинами",
    when: "Пауза між частинами статті, коли підзаголовок зайвий.",
  },
};
