"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { SIDEBAR_COOKIE } from "./sidebar";

/** Запамʼятати стан меню (сервер читає cookie — сторінка одразу малюється правильно) */
function saveCollapsed(collapsed: boolean) {
  document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? "collapsed" : "open"}; path=/admin; max-age=31536000; samesite=lax`;
}

/**
 * Каркас адмінки з боковим меню, яке можна згорнути до вузької смуги з іконками.
 * Вміст праворуч розтягується. На планшеті й телефоні меню — верхня панель (без згортання).
 */
const PanelShell = ({
  initialCollapsed,
  sidebarTop,
  sidebarBottom,
  children,
}: {
  initialCollapsed: boolean;
  sidebarTop: ReactNode;
  sidebarBottom: ReactNode;
  children: ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggle = () => {
    setCollapsed(!collapsed);
    saveCollapsed(!collapsed);
  };

  return (
    <div className={`panel ${collapsed ? "panel--collapsed" : ""}`.trim()}>
      <aside className="panel__sidebar">
        {sidebarTop}
        <button
          type="button"
          className="panel__nav-link panel__toggle"
          onClick={toggle}
          aria-expanded={!collapsed}
          title={collapsed ? "Розгорнути меню" : "Згорнути меню"}
        >
          <Icon name={collapsed ? "panelOpen" : "panelClose"} />
          <span className="panel__label">Згорнути меню</span>
        </button>
        {sidebarBottom}
      </aside>

      <main className="panel__main">{children}</main>
    </div>
  );
};

export default PanelShell;
