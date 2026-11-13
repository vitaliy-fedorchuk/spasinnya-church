"use client";

import { Fragment, useEffect, useRef, useState, type ComponentType } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ArticleBlock, BlockType } from "@/features/blog/types";
import { BLOCK_TYPES } from "@/features/blog/editor";
import { BLOCKS } from "@/features/blog/blocks/registry";
import { BLOCK_FIELDS } from "./BlockFields";

interface BlockListProps {
  blocks: ArticleBlock[];
  /** Помилки перевірки: id блоку → повідомлення */
  errors: Record<string, string>;
  onChange: (block: ArticleBlock) => void;
  onInsert: (index: number, type: BlockType) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
}

// ---------- Меню «Додати блок» ----------

const Inserter = ({ onPick, prominent }: { onPick: (type: BlockType) => void; prominent?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={`ed-inserter ${prominent ? "ed-inserter--prominent" : ""} ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="ed-inserter__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Додати блок сюди"
      >
        {prominent ? "+ Додати блок" : "+"}
      </button>
      {open && (
        <ul className="ed-inserter__menu" role="menu">
          {BLOCK_TYPES.map((type) => (
            <li key={type} role="none">
              <button
                type="button"
                role="menuitem"
                className="ed-inserter__item"
                onClick={() => {
                  onPick(type);
                  setOpen(false);
                }}
              >
                <span className="ed-inserter__label">{BLOCKS[type].label}</span>
                <span className="ed-inserter__hint">{BLOCK_FIELDS[type].hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ---------- Картка блоку ----------

interface CardProps {
  block: ArticleBlock;
  index: number;
  total: number;
  error?: string;
  onChange: (block: ArticleBlock) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
}

const BlockCard = ({ block, index, total, error, onChange, onMove, onDuplicate, onRemove }: CardProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const Fields = BLOCK_FIELDS[block.type].component as ComponentType<{
    block: ArticleBlock;
    onChange: (b: ArticleBlock) => void;
  }>;

  return (
    <section
      ref={setNodeRef}
      id={`block-${block.id}`}
      className={`ed-block ${isDragging ? "is-dragging" : ""} ${error ? "has-error" : ""}`.trim()}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-label={BLOCKS[block.type].label}
    >
      <header className="ed-block__head">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="ed-block__handle"
          title="Перетягнути"
          {...attributes}
          {...listeners}
        >
          <svg viewBox="0 0 12 20" aria-hidden="true">
            {[4, 10, 16].map((y) => (
              <Fragment key={y}>
                <circle cx="3" cy={y} r="1.6" />
                <circle cx="9" cy={y} r="1.6" />
              </Fragment>
            ))}
          </svg>
        </button>
        <span className="ed-block__type">{BLOCKS[block.type].label}</span>

        <div className="ed-block__actions">
          <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} title="Вище">
            ↑
          </button>
          <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === total - 1} title="Нижче">
            ↓
          </button>
          <button type="button" onClick={() => onDuplicate(index)} title="Дублювати">
            ⧉
          </button>
          <button
            type="button"
            className="ed-block__remove"
            title="Видалити"
            onClick={() => {
              if (window.confirm(`Видалити блок «${BLOCKS[block.type].label}»?`)) onRemove(index);
            }}
          >
            ✕
          </button>
        </div>
      </header>

      <div className="ed-block__body">
        <Fields block={block} onChange={onChange} />
        {error && (
          <p className="ed-block__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

// ---------- Список ----------

const BlockList = ({ blocks, errors, onChange, onInsert, onMove, onDuplicate, onRemove }: BlockListProps) => {
  const sensors = useSensors(
    // Перетягування починається після руху на 5px — щоб клік по ручці не «смикав»
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(
      blocks.findIndex((b) => b.id === active.id),
      blocks.findIndex((b) => b.id === over.id),
    );
  };

  return (
    <div className="ed-blocks">
      {/* id — щоб службові aria-атрибути dnd-kit збігались на сервері й у браузері */}
      <DndContext id="article-blocks" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <Fragment key={block.id}>
              <Inserter onPick={(type) => onInsert(i, type)} />
              <BlockCard
                block={block}
                index={i}
                total={blocks.length}
                error={errors[block.id]}
                onChange={onChange}
                onMove={onMove}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && <p className="ed-blocks__empty">Стаття поки порожня. Почніть із вступу або тексту.</p>}
      <Inserter prominent onPick={(type) => onInsert(blocks.length, type)} />
    </div>
  );
};

export default BlockList;
