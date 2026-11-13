import type { ReactNode } from "react";
import "./Rubricator.scss";

interface RubricatorProps {
  /** Іконка 16×16 (шлях до svg) */
  icon?: string;
  children: ReactNode;
  className?: string;
}

/** Мітка-пігулка над заголовком секції («Наше бачення», «Про нас»…) */
const Rubricator = ({ icon, children, className = "" }: RubricatorProps) => {
  return (
    <span className={`rubricator ${className}`.trim()}>
      {icon && <img className="rubricator__icon" src={icon} width={16} height={16} alt="" />}
      <span className="rubricator__text">{children}</span>
    </span>
  );
};

export default Rubricator;
