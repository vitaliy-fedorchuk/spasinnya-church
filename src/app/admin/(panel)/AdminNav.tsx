"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Розділи адмінки. Нові (медіатека, події…) додаються сюди. */
const ITEMS = [{ href: "/admin/articles", label: "Статті" }];

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
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
