export interface NavLink {
  label: string;
  href: string;
  /** Виділений пункт — коричневий колір */
  current?: boolean;
}

// TODO: замінити якорі на реальні id секцій, коли вони з'являться
export const navLinks: NavLink[] = [
  { label: "Головна", href: "#" },
  { label: "Про нас", href: "#about", current: true },
  { label: "Служіння", href: "#services" },
  { label: "Події", href: "#events" },
  { label: "Контакти", href: "#contact" },
];
