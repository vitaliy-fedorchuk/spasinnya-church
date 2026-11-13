import youthImage from "../../assets/events/youth.webp";
import churchImage from "../../public/images/hero-fon.webp";
import { mondayIndex, toDateKey } from "./calendarUtils";

export const CALENDAR_TIME_ZONE = "Europe/Kyiv";

/** Скільки місяців можна гортати назад і вперед від поточного */
export const MONTHS_PAST = 1;
export const MONTHS_FUTURE = 12;

export const MONTH_NAMES = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

/** Родовий відмінок — для дат: «14 листопада» */
export const MONTH_NAMES_GENITIVE = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

/** Понеділок → неділя */
export const WEEKDAY_SHORT = ["П", "В", "С", "Ч", "П", "С", "Н"];
export const WEEKDAY_NAMES = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];

export interface ChurchEvent {
  id: string;
  title: string;
  /** День тижня: 0 — понеділок … 6 — неділя */
  weekday: number;
  time: string;
  description: string;
  image: string;
  /** Формат: «Офлайн», «Онлайн»… (необов'язково) */
  format?: string;
  /** Де саме в церкві (необов'язково) */
  place?: string;
}

/**
 * Щотижневі зустрічі (як у розкладі у футері).
 * TODO: описи, фото, формат і місце для всіх, крім молодіжки, — тимчасові;
 * замінити на справжні.
 */
export const WEEKLY_EVENTS: ChurchEvent[] = [
  {
    id: "youth",
    title: "Молодіжна зустріч",
    weekday: 0,
    time: "19:00",
    description:
      "Кожного тижня молодь збирається разом, щоб поклонятися Богу. Це час, де можна знайти справжніх друзів. Приходь сам або приводь когось із друзів.",
    image: youthImage,
    format: "Офлайн",
    place: "Молодіжна кімната",
  },
  {
    id: "prayer",
    title: "Молитовне служіння",
    weekday: 2,
    time: "19:00",
    description: "Серед тижня збираємось, щоб разом молитися за церкву, родини, місто та Україну.",
    image: churchImage,
  },
  {
    id: "kids-school",
    title: "Дитяча школа",
    weekday: 5,
    time: "11:00",
    description: "Біблійні історії, ігри та творчість для дітей у турботливій атмосфері.",
    image: churchImage,
  },
  {
    id: "teens",
    title: "Підлітковий клуб",
    weekday: 5,
    time: "18:00",
    description: "Зустрічі для підлітків: спілкування, запитання про віру і час разом із друзями.",
    image: churchImage,
  },
  {
    id: "sunday-morning",
    title: "Ранкове богослужіння",
    weekday: 6,
    time: "10:00",
    description: "Недільне богослужіння для всієї церкви: прославлення, молитва і проповідь Божого Слова.",
    image: churchImage,
  },
  {
    id: "sunday-evening",
    title: "Вечірнє богослужіння",
    weekday: 6,
    time: "17:00",
    description: "Вечірнє богослужіння: спільна молитва, прославлення і проповідь.",
    image: churchImage,
  },
];

/** Події конкретного дня, відсортовані за часом */
export const getEventsForDate = (date: Date) =>
  WEEKLY_EVENTS.filter((event) => event.weekday === mondayIndex(date)).sort((a, b) =>
    a.time.localeCompare(b.time),
  );

/** Найближчий день з подіями, починаючи з сьогодні (у межах тижня — бо події щотижневі) */
export const findNextEventDate = (from: Date) => {
  for (let i = 0; i < 7; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    if (getEventsForDate(date).length) return toDateKey(date);
  }
  return null;
};
