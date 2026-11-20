import type { ReactNode } from "react";
import "./BlackButton.scss";
import { ARROW_PATH } from "./arrowPath";

interface ButtonProps {
  text?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
  circleColor?: string;
  svgColor?: string;
  className?: string;
  /** Своя іконка в кружечку замість стрілки (не обертається при ховері) */
  icon?: ReactNode;
  /** Відкривати посилання в новій вкладці */
  external?: boolean;
  /** Без кружка зі стрілкою — лише текст */
  plain?: boolean;
}

const BlackButton = ({
  text = "Я тут вперше",
  href = "/ya-tut-vpershe",
  bgColor = "#262626",
  textColor = "#fff",
  circleColor = "#f5f5f5",
  svgColor = "#262626",
  className = "",
  icon,
  external = false,
  plain = false,
}: ButtonProps) => {
  return (
    <div className={`black-button ${className}`.trim()}>
      <a
        href={href}
        className="black-button__link"
        {...(external && { target: "_blank", rel: "noreferrer" })}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span className="black-button__label">
          <span className="black-button__text">{text}</span>
        </span>
        {!plain && (
          <div className="black-button__circle" style={{ backgroundColor: circleColor }}>
            {icon ?? (
              <svg
                className="black-button__icon"
                style={{ fill: svgColor }}
                width="22"
                height="22"
                viewBox="0 0 22 22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={ARROW_PATH} />
              </svg>
            )}
          </div>
        )}
      </a>
    </div>
  );
};

export default BlackButton;
