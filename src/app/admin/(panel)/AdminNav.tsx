"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

/** Розділи адмінки. Нові (події, служіння…) додаються сюди. */
const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/articles", label: "Статті", icon: "articles" },
  { href: "/admin/events", label: "Події", icon: "calendar" },
  { href: "/admin/authors", label: "Автори", icon: "users" },
  { href: "/admin/tags", label: "Теги", icon: "tag" },
  { href: "/admin/stats", label: "Цифри", icon: "stats" },
  { href: "/admin/media", label: "Медіатека", icon: "media" },
  { href: "/admin/blocks", label: "Блоки", icon: "blocks" },
];

const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="panel__nav" aria-label="Розділи адмінки">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`panel__nav-link ${active ? "panel__nav-link--active" : ""}`.trim()}
            aria-current={active ? "page" : undefined}
            title={item.label}
          >
            <Icon name={item.icon} />
            <span className="panel__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
