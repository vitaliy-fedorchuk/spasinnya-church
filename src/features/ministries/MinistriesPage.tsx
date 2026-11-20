import "./MinistriesPage.scss";
import Rubricator from "@/components/ui/Rubricator";
import archeryIconAsset from "@/assets/icons/archery.svg";
import heroPhotoAsset from "@/assets/events/youth.webp";
import { MINISTRIES, type Ministry } from "./data";

const archeryIcon = archeryIconAsset.src;
const heroPhoto = heroPhotoAsset.src;

/** Вікові групи: служіння з data.ts за назвою. Межі віку — орієнтовні */
const AGE_GROUPS = [
  {
    id: "dity",
    label: "Діти",
    ages: "3–11 років",
    items: ["Творча студія «Спасіння»", "Дошкільна студія «Спасіння»", "Дитяча школа"],
  },
  {
    id: "pidlitky",
    label: "Підлітки",
    ages: "12–16 років",
    items: ["Підлітковий клуб", "Підлітковий коледж «Тимофій»"],
  },
  { id: "molod", label: "Молодь", ages: "16–30 років", items: ["Молодіжне служіння"] },
  // TODO: уточнити вікову межу
  { id: "dorosli", label: "Дорослі", ages: "30+", items: ["Жіноче служіння"] },
];

type Group = (typeof AGE_GROUPS)[number];

const byTitle = (t: string) => MINISTRIES.find((m) => m.title === t);

/** Групи з одним служінням, що стоять поруч, — в один ряд по дві (інакше картка на всю ширину) */
const rows = (groups: Group[]): Group[][] => {
  const out: Group[][] = [];
  for (const g of groups) {
    const last = out.at(-1);
    if (g.items.length === 1 && last?.length === 1 && last[0].items.length === 1) last.push(g);
    else out.push([g]);
  }
  return out;
};

const Card = ({ m }: { m: Ministry }) => (
  <li className="min-ages__card">
    <div className="min-ages__media" data-surface="dark">
      <img className="min-ages__photo" src={m.photo} alt="" loading="lazy" />
      {m.logo && <img className={`min-ages__logo${m.logoInverted ? " is-inverted" : ""}`} src={m.logo} alt="" />}
      <span className="min-ages__tag">{m.tag}</span>
    </div>
    <h3 className="min-ages__title">{m.title}</h3>
    <p className="min-ages__text">{m.text}</p>
  </li>
);

const GroupBlock = ({ g }: { g: Group }) => {
  const items = g.items.map(byTitle).filter((m): m is Ministry => !!m);
  return (
    <div id={g.id} className="min-ages__group">
      <header className="min-ages__head">
        <h2 className="min-ages__label">{g.label}</h2>
        <span className="min-ages__range">{g.ages}</span>
      </header>
      <ul className="min-ages__list" data-count={items.length}>
        {items.map((m) => (
          <Card key={m.title} m={m} />
        ))}
      </ul>
    </div>
  );
};

/** «Служіння та проєкти» — усі служіння церкви за віком (ті самі, що в картках на головній) */
const MinistriesPage = () => (
  <main className="min-page">
    <header className="min-hero page-hero" data-surface="dark">
      <img className="min-hero__bg page-hero__bg" src={heroPhoto} alt="" />
      <div className="container min-hero__inner" data-intro>
        <Rubricator icon={archeryIcon} className="rubricator--light">
          Діяльність
        </Rubricator>
        <h1 className="min-hero__title page-title">Служіння та проєкти церкви</h1>
        <p className="min-hero__lead">
          Ми віримо, що кожна людина має дар і покликання. Наші служіння — це місця, де ці дари знаходять застосування і
          приносять плід.
        </p>
      </div>
    </header>

    <section className="container min-section" aria-label="Служіння за віком">
      <nav className="min-ages__scale" aria-label="Вікові групи">
        {AGE_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="min-ages__step">
            <b>{g.label}</b>
            <span>{g.ages}</span>
          </a>
        ))}
      </nav>

      {rows(AGE_GROUPS).map((row) =>
        row.length === 1 ? (
          <GroupBlock key={row[0].id} g={row[0]} />
        ) : (
          <div key={row.map((g) => g.id).join("-")} className="min-ages__pair">
            {row.map((g) => (
              <GroupBlock key={g.id} g={g} />
            ))}
          </div>
        ),
      )}
    </section>
  </main>
);

export default MinistriesPage;
