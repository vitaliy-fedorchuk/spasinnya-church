"use client";

import type { CSSProperties } from "react";
import "./FullscreenMenu.scss";
import { navLinks } from "./navLinks";

export const FULLSCREEN_MENU_ID = "fullscreen-menu";

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenMenu = ({ isOpen, onClose }: FullscreenMenuProps) => {
  return (
    <div
      id={FULLSCREEN_MENU_ID}
      className={`fullscreen-menu${isOpen ? " fullscreen-menu--open" : ""}`}
      data-lenis-prevent
      inert={!isOpen}
    >
      <ul className="fullscreen-menu__list">
        {navLinks.map((link, index) => (
          <li
            key={link.href}
            className="fullscreen-menu__item"
            style={
              {
                "--index": index,
                "--reverse-index": navLinks.length - 1 - index,
              } as CSSProperties
            }
          >
            <a
              href={link.href}
              className={`fullscreen-menu__link${link.current ? " fullscreen-menu__link--current" : ""}`}
              aria-current={link.current ? "page" : undefined}
              onClick={onClose}
            >
              <span className="fullscreen-menu__link-text">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="fullscreen-menu__bottom">
        <p className="fullscreen-menu__word">Церква «Спасіння»</p>
        <p className="fullscreen-menu__word">Ласкаво просимо</p>
      </div>
    </div>
  );
};

export default FullscreenMenu;
