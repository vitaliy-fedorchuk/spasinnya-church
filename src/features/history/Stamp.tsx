import LogoMark from "@/components/ui/LogoMark";

/** Прямокутний штамп «Зареєстровано 17 березня 2016» з голубкою з логотипу */
const Stamp = () => (
  <span className="history-stamp history-stamp--rect" aria-hidden="true">
    <LogoMark className="history-stamp__dove" />
    <span className="history-stamp__label">Зареєстровано</span>
    <b>17 березня 2016</b>
    <span className="history-stamp__label">Церква «Спасіння»</span>
  </span>
);

export default Stamp;
