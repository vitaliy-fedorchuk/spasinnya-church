import type { ReactNode } from "react";
import type { AboutPage } from "./aboutPages";
import { ARROW_PATH } from "@/components/buttons/arrowPath";

/** Стрілка — та сама, що в кнопках на головній (BlackButton) */
export const Arrow = () => (
  <svg className="hubv-arrow-icon" viewBox="0 0 22 22" aria-hidden="true">
    <path d={ARROW_PATH} />
  </svg>
);

export const Soon = () => <span className="hubv-soon">Скоро</span>;

export const num = (i: number) => String(i + 1).padStart(2, "0");

/** Посилання, або неклікабельний блок для сторінок «Скоро» */
export const AboutItem = ({
  page,
  className,
  children,
}: {
  page: AboutPage;
  className: string;
  children: ReactNode;
}) =>
  page.href ? (
    <a className={className} href={page.href}>
      {children}
    </a>
  ) : (
    <div className={`${className} is-soon`} aria-disabled="true">
      {children}
    </div>
  );
