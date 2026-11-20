export interface NavLink {
  label: string;
  href: string;
  /** Поточна сторінка — коричневий колір і aria-current */
  current?: boolean;
  /** Акцентний пункт (коричневий), але не «поточна сторінка» */
  accent?: boolean;
}

// TODO: замінити якорі на реальні id секцій, коли вони з'являться
export const navLinks: NavLink[] = [
  { label: "Головна", href: "/" },
  { label: "Я тут вперше", href: "/ya-tut-vpershe", accent: true },
  { label: "Про нас", href: "/pro-nas" },
  { label: "Служіння", href: "/sluzhinnya" },
  { label: "Новини", href: "/blog" },
  { label: "Контакти", href: "/kontakty" },
];
