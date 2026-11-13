import type { ReactNode } from "react";
import "./BlackButton.scss";

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
}

const BlackButton = ({
  text = "Я тут вперше",
  href = "/#services",
  bgColor = "#262626",
  textColor = "#fff",
  circleColor = "#f5f5f5",
  svgColor = "#262626",
  className = "",
  icon,
  external = false,
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
              <path d="M5.09458 17.9091L16.3528 6.6509L16.3528 13.4278C16.3507 13.548 16.3726 13.6675 16.4171 13.7791C16.4617 13.8908 16.528 13.9924 16.6123 14.0782C16.6965 14.1639 16.797 14.232 16.9079 14.2785C17.0188 14.325 17.1378 14.3489 17.258 14.3489C17.3782 14.3489 17.4972 14.325 17.6081 14.2785C17.719 14.232 17.8195 14.1639 17.9037 14.0782C17.988 13.9924 18.0543 13.8908 18.0989 13.7791C18.1434 13.6675 18.1653 13.548 18.1632 13.4278L18.1632 4.46533C18.1632 4.22526 18.0678 3.99504 17.898 3.82529C17.7283 3.65553 17.4981 3.56015 17.258 3.56011L8.29548 3.56011C8.05813 3.56424 7.83189 3.66142 7.6655 3.83073C7.4991 4.00005 7.40586 4.22794 7.40586 4.46533C7.40586 4.70272 7.4991 4.93061 7.6655 5.09992C7.83189 5.26923 8.05813 5.36642 8.29548 5.37054L15.0724 5.37054L3.81422 16.6287C3.64444 16.7985 3.54905 17.0288 3.54905 17.2689C3.54905 17.509 3.64444 17.7393 3.81422 17.9091C3.98401 18.0789 4.21429 18.1743 4.4544 18.1743C4.69452 18.1743 4.9248 18.0789 5.09458 17.9091Z" />
            </svg>
          )}
        </div>
      </a>
    </div>
  );
};

export default BlackButton;
