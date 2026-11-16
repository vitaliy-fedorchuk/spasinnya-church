import "./EventsSection.scss";
import Rubricator from "../ui/Rubricator";
import { EventsCalendar } from "../../features/events-calendar";
import { getEventsSettings, getSiteEvents } from "@/server/events";
import timeIconAsset from "../../assets/events/time-together.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const timeIcon = timeIconAsset.src;

/** Графік подій: тексти й події — з адмінки («Події» → «Налаштування блоку») */
const EventsSection = async () => {
  const [settings, events] = await Promise.all([getEventsSettings(), getSiteEvents()]);

  return (
    <section className="events" aria-labelledby="events-title">
      <div className="container">
        <header className="events__header">
          {settings.rubric && <Rubricator icon={timeIcon}>{settings.rubric}</Rubricator>}
          <h2 id="events-title" className="section-title events__title">
            {settings.title} {settings.titleAccent && <span className="section-title__accent">{settings.titleAccent}</span>}
          </h2>
          {settings.text && <p className="events__text">{settings.text}</p>}
        </header>

        <EventsCalendar events={events} monthsPast={settings.monthsPast} monthsFuture={settings.monthsFuture} />
      </div>
    </section>
  );
};

export default EventsSection;
