import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";
import { variantOf } from "@/features/media/urls";
import LogoMark from "@/components/ui/LogoMark";
import AdminNav from "./AdminNav";
import Logo from "./Logo";
import PanelShell from "./PanelShell";
import { Icon } from "./icons";
import { SIDEBAR_COOKIE } from "./sidebar";
import "./panel.scss";

const ROLE_LABEL = { ADMIN: "Адміністратор", EDITOR: "Редактор" } as const;

/** Ініціали для кружка, коли фото немає: «Віталій Федорчук» → «ВФ» */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Каркас адмінки: бокове меню (згортається; на телефоні — верхня панель) + вміст */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <PanelShell
      initialCollapsed={collapsed}
      sidebarTop={
        <>
          <a className="panel__brand" href="/admin" aria-label="Церква Спасіння — адмінпанель блогу">
            <Logo className="panel__logo" />
            <LogoMark className="panel__logo-mark" />
            <span className="panel__brand-sub">Адмінпанель блогу сайту</span>
          </a>
          <AdminNav />
        </>
      }
      sidebarBottom={
        <div className="panel__user">
          <div className="panel__user-card" title={`${user.name} · ${ROLE_LABEL[user.role]}`}>
            <span className="panel__avatar">
              {user.avatar ? <img src={variantOf(user.avatar, 480)} alt="" /> : initials(user.name)}
            </span>
            <span className="panel__user-info panel__label">
              <span className="panel__user-name">{user.name}</span>
              <span className="panel__user-role">{ROLE_LABEL[user.role]}</span>
            </span>
          </div>
          <a className="panel__nav-link panel__small-link" href="/" target="_blank" rel="noreferrer" title="Відкрити сайт">
            <Icon name="site" />
            <span className="panel__label">Відкрити сайт</span>
          </a>
          <form action={logout}>
            <button className="panel__nav-link panel__small-link" type="submit" title="Вийти">
              <Icon name="logout" />
              <span className="panel__label">Вийти</span>
            </button>
          </form>
        </div>
      }
    >
      {children}
    </PanelShell>
  );
}
