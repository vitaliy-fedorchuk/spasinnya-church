"use client";

import { useEffect, useRef, useState } from "react";
import type { BlockType } from "@/features/blog/types";
import { BLOCKS } from "@/features/blog/blocks/registry";
import { BLOCK_GROUPS, BLOCK_INFO } from "@/features/blog/blocks/catalog";
import { SAMPLE_BLOCKS } from "@/features/blog/blocks/samples";
import ArticleBlocks from "@/features/blog/blocks/ArticleBlocks";
import { BLOCK_ICON, Icon } from "../../icons";
import "./BlockPicker.scss";

/**
 * Вікно «Додати блок» — по центру екрана (не обрізається, як випадне меню).
 * Ліворуч — блоки за групами, праворуч — як вибраний блок виглядає на сайті
 * (ті самі компоненти, що й на сайті, з прикладом тексту й фото).
 */
const BlockPicker = ({ onPick, onClose }: { onPick: (type: BlockType) => void; onClose: () => void }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<BlockType>("text");

  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    // Фокус на перший пункт — щоб можна було обрати стрілками й Enter
    d?.querySelector<HTMLButtonElement>(".bp-item")?.focus();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="bp"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Додати блок"
    >
      <div className="bp__inner">
        <header className="bp__head">
          <h2 className="bp__title">Додати блок</h2>
          <button type="button" className="bp__close" onClick={onClose} aria-label="Закрити">
            <Icon name="close" />
          </button>
        </header>

        <div className="bp__body">
          <div className="bp__list">
            {BLOCK_GROUPS.map((group) => (
              <section key={group.id} className="bp__group">
                <h3 className="bp__group-title">{group.label}</h3>
                <ul>
                  {group.types.map((type) => (
                    <li key={type}>
                      <button
                        type="button"
                        className={`bp-item ${active === type ? "is-active" : ""}`.trim()}
                        onMouseEnter={() => setActive(type)}
                        onFocus={() => setActive(type)}
                        onClick={() => onPick(type)}
                      >
                        <span className="bp-item__icon">
                          <Icon name={BLOCK_ICON[type]} />
                        </span>
                        <span className="bp-item__text">
                          <span className="bp-item__label">{BLOCKS[type].label}</span>
                          <span className="bp-item__hint">{BLOCK_INFO[type].hint}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <aside className="bp__preview" aria-label="Як виглядає">
            <p className="bp__preview-label">Як виглядає на сайті</p>
            <div className="bp__preview-stage">
              <ArticleBlocks blocks={[SAMPLE_BLOCKS[active]]} />
            </div>
            <p className="bp__when">{BLOCK_INFO[active].when}</p>
            <a className="bp__all" href="/admin/blocks" target="_blank" rel="noreferrer">
              Усі блоки з прикладами
              <Icon name="external" />
            </a>
          </aside>
        </div>
      </div>
    </dialog>
  );
};

export default BlockPicker;
