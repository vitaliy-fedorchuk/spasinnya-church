import type { Ref } from "react";
import "./MenuToggle.scss";
import { FULLSCREEN_MENU_ID } from "./FullscreenMenu";

interface MenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

const MenuToggle = ({ isOpen, onToggle, className = "", ref }: MenuToggleProps) => {
  return (
    <button
      ref={ref}
      type="button"
      className={["menu-toggle", isOpen && "menu-toggle--active", className].filter(Boolean).join(" ")}
      aria-expanded={isOpen}
      aria-controls={FULLSCREEN_MENU_ID}
      onClick={onToggle}
    >
      <span className="menu-toggle__text">Меню</span>
      <span className="menu-toggle__icon" aria-hidden="true">
        <span className="menu-toggle__bar menu-toggle__bar--top" />
        <span className="menu-toggle__bar menu-toggle__bar--bottom" />
      </span>
    </button>
  );
};

export default MenuToggle;
