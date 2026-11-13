"use client";

import { Fragment, useState, type ComponentType } from "react";
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
import { BLOCKS } from "@/features/blog/blocks/registry";
import { BLOCK_FIELDS } from "./BlockFields";
import BlockPicker from "./BlockPicker";
import { BLOCK_ICON, Icon } from "../../icons";

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

// ---------- «+» між блоками / «Додати блок» унизу ----------

const Inserter = ({ onOpen, prominent }: { onOpen: () => void; prominent?: boolean }) => (
  <div className={`ed-inserter ${prominent ? "ed-inserter--prominent" : ""}`.trim()}>
    <button type="button" className="ed-inserter__toggle" onClick={onOpen} title="Додати блок сюди">
      <Icon name="plus" />
      {prominent && "Додати блок"}
    </button>
  </div>
);

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
          <Icon name="grip" />
        </button>
        <span className="ed-block__type">
          <Icon name={BLOCK_ICON[block.type]} />
          {BLOCKS[block.type].label}
        </span>

        <div className="ed-block__actions">
          <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} title="Вище">
            <Icon name="up" />
          </button>
          <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === total - 1} title="Нижче">
            <Icon name="down" />
          </button>
          <button type="button" onClick={() => onDuplicate(index)} title="Дублювати">
            <Icon name="copy" />
          </button>
          <button
            type="button"
            className="ed-block__remove"
            title="Видалити"
            onClick={() => {
              if (window.confirm(`Видалити блок «${BLOCKS[block.type].label}»?`)) onRemove(index);
            }}
          >
            <Icon name="trash" />
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
  // Куди вставляти блок, вибраний у вікні (null — вікно закрите)
  const [insertAt, setInsertAt] = useState<number | null>(null);

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
              <Inserter onOpen={() => setInsertAt(i)} />
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
      <Inserter prominent onOpen={() => setInsertAt(blocks.length)} />

      {insertAt !== null && (
        <BlockPicker
          onClose={() => setInsertAt(null)}
          onPick={(type) => {
            onInsert(insertAt, type);
            setInsertAt(null);
          }}
        />
      )}
    </div>
  );
};

export default BlockList;
