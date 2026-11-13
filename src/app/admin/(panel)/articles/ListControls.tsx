"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../icons";

import { VIEW_COOKIE } from "./view";

/** Випадний список, що одразу застосовує фільтр (відправляє свою форму) */
export const AutoSelect = ({
  name,
  value,
  label,
  children,
}: {
  name: string;
  value: string;
  label: string;
  children: ReactNode;
}) => (
  <select
    className="a-input articles__select"
    name={name}
    defaultValue={value}
    aria-label={label}
    onChange={(e) => e.currentTarget.form?.requestSubmit()}
  >
    {children}
  </select>
);

/** Запамʼятати вибраний вигляд на рік (сервер читає cookie, коли в адресі немає ?view) */
function rememberView(v: string) {
  document.cookie = `${VIEW_COOKIE}=${v}; path=/admin; max-age=31536000; samesite=lax`;
}

/** Перемикач «рядки / картки» */
export const ViewToggle = ({ view, hrefFor }: { view: "list" | "grid"; hrefFor: { list: string; grid: string } }) => {
  return (
    <div className="articles__view" role="group" aria-label="Вигляд списку">
      {(["list", "grid"] as const).map((v) => (
        <Link
          key={v}
          href={hrefFor[v]}
          onClick={() => rememberView(v)}
          className={`articles__view-btn ${view === v ? "is-active" : ""}`.trim()}
          aria-current={view === v ? "true" : undefined}
          title={v === "list" ? "Рядками" : "Картками"}
        >
          <Icon name={v === "list" ? "viewList" : "viewGrid"} />
          <span className="visually-hidden">{v === "list" ? "Рядками" : "Картками"}</span>
        </Link>
      ))}
    </div>
  );
};
