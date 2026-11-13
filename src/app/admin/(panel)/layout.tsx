import type { ReactNode } from "react";
import { requireUser } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";
import AdminNav from "./AdminNav";
import "./panel.scss";

const ROLE_LABEL = { ADMIN: "Адміністратор", EDITOR: "Редактор" } as const;

/** Каркас адмінки: бокове меню (на телефоні — верхня панель) + вміст */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="panel">
      <aside className="panel__sidebar">
        <a className="panel__brand" href="/admin">
          <span className="panel__brand-name">Церква Спасіння</span>
          <span className="panel__brand-sub">Адмінка</span>
        </a>

        <AdminNav />

        <div className="panel__user">
          <div className="panel__user-info">
            <span className="panel__user-name">{user.name}</span>
            <span className="panel__user-role">{ROLE_LABEL[user.role]}</span>
          </div>
          <a className="panel__site-link" href="/" target="_blank" rel="noreferrer">
            Відкрити сайт ↗
          </a>
          <form action={logout}>
            <button className="panel__logout" type="submit">
              Вийти
            </button>
          </form>
        </div>
      </aside>

      <main className="panel__main">{children}</main>
    </div>
  );
}
