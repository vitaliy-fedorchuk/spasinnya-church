import "./EventsSection.scss";
import Rubricator from "../ui/Rubricator";
import { EventsCalendar } from "../../features/events-calendar";
import timeIcon from "../../assets/events/time-together.svg";

const EventsSection = () => {
  return (
    <section className="events" aria-labelledby="events-title">
      <div className="container">
        <header className="events__header">
          <Rubricator icon={timeIcon}>Час разом</Rubricator>
          <h2 id="events-title" className="section-title events__title">
            Графік <span className="section-title__accent">подій та зустрічей</span>
          </h2>
          <p className="events__text">
            Перегляньте, щоб не пропустити час спільної молитви, богослужінь і теплих зустрічей з
            церквою
          </p>
        </header>

        <EventsCalendar />
      </div>
    </section>
  );
};

export default EventsSection;
