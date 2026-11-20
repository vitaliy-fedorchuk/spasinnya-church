"use client";

import type { ComponentType } from "react";
import type { ArticleBlock, BlockType, WordMark } from "@/features/blog/types";
import { Checkbox, Field, ImageInput, RichTextarea, Textarea, TextInput } from "./fields";
import { DividerFields, GalleryFields } from "./LayoutFields";

type Props<T extends BlockType> = {
  block: Extract<ArticleBlock, { type: T }>;
  onChange: (block: Extract<ArticleBlock, { type: T }>) => void;
};

/** YouTube: приймаємо і посилання, і сам ID */
const youtubeIdFrom = (input: string) => {
  const v = input.trim();
  const m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{6,20})/);
  return m ? m[1] : v;
};

// Абзаци — один textarea, абзаци розділені порожнім рядком
const PARAGRAPH_SPLIT = /\n\s*\n/;

/**
 * Форма для кожного виду блоку. Парний реєстр до blocks/registry.ts (там —
 * як блок виглядає на сайті, тут — як його редагують). TypeScript не дасть
 * забути форму для нового виду.
 */
export const BLOCK_FIELDS: { [T in BlockType]: { component: ComponentType<Props<T>> } } = {
  lead: {
    component: ({ block, onChange }) => (
      <RichTextarea label="Текст" value={block.text} onChange={(text) => onChange({ ...block, text })} large />
    ),
  },
  dropcap: {
    component: ({ block, onChange }) => (
      <RichTextarea
        label="Текст"
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
        hint="Перша літера стане великою автоматично"
        large
      />
    ),
  },
  text: {
    component: ({ block, onChange }) => (
      <RichTextarea
        label="Текст"
        value={block.paragraphs.join("\n\n")}
        onChange={(v) => onChange({ ...block, paragraphs: v.split(PARAGRAPH_SPLIT) })}
        hint="Новий абзац — після порожнього рядка"
        rows={5}
      />
    ),
  },
  heading: {
    component: ({ block, onChange }) => (
      <div className="ed-row">
        <Field label="Рівень">
          <select
            className="ed-input"
            value={block.level}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) === 3 ? 3 : 2 })}
          >
            <option value={2}>Розділ (H2)</option>
            <option value={3}>Підрозділ (H3)</option>
          </select>
        </Field>
        <TextInput label="Текст" value={block.text} onChange={(text) => onChange({ ...block, text })} />
      </div>
    ),
  },
  quote: {
    component: ({ block, onChange }) => (
      <>
        <RichTextarea label="Цитата" value={block.text} onChange={(text) => onChange({ ...block, text })} />
        <div className="ed-row">
          <TextInput label="Автор" value={block.author ?? ""} onChange={(author) => onChange({ ...block, author })} />
          <TextInput label="Посада / підпис" value={block.role ?? ""} onChange={(role) => onChange({ ...block, role })} />
        </div>
      </>
    ),
  },
  verse: {
    component: ({ block, onChange }) => (
      <>
        <Textarea
          label="Текст вірша"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          hint="Без лапок — вони додаються самі"
        />
        <TextInput
          label="Посилання"
          value={block.reference}
          placeholder="Івана 3:16"
          onChange={(reference) => onChange({ ...block, reference })}
        />
      </>
    ),
  },
  word: {
    component: ({ block, onChange }) => (
      <>
        <RichTextarea label="Текст" value={block.text} onChange={(text) => onChange({ ...block, text })} />
        <div className="ed-row">
          <TextInput
            label="Підпис"
            value={block.caption ?? ""}
            placeholder="Пророче слово · 2016"
            onChange={(caption) => onChange({ ...block, caption })}
          />
          <Field label="Знак">
            <select
              className="ed-input"
              value={block.mark ?? "dove"}
              onChange={(e) => onChange({ ...block, mark: e.target.value as WordMark })}
            >
              <option value="dove">Голубка на фоні</option>
              <option value="emblem">Голубка над текстом</option>
              <option value="quote">Лапки</option>
            </select>
          </Field>
        </div>
      </>
    ),
  },
  image: {
    component: ({ block, onChange }) => (
      <>
        <ImageInput label="Фото" src={block.image.src} alt={block.image.alt} onChange={(image) => onChange({ ...block, image })} />
        <TextInput label="Підпис" value={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} />
        <Checkbox label="Ширше за текст" checked={!!block.wide} onChange={(wide) => onChange({ ...block, wide })} />
      </>
    ),
  },
  gallery: { component: GalleryFields },
  list: {
    component: ({ block, onChange }) => (
      <>
        <RichTextarea
          label="Пункти"
          value={block.items.join("\n")}
          onChange={(v) => onChange({ ...block, items: v.split("\n") })}
          hint="Кожен пункт — з нового рядка"
          rows={4}
        />
        <Checkbox label="Нумерований" checked={!!block.ordered} onChange={(ordered) => onChange({ ...block, ordered })} />
      </>
    ),
  },
  video: {
    component: ({ block, onChange }) => (
      <>
        <TextInput
          label="Посилання на YouTube"
          value={block.youtubeId}
          placeholder="https://www.youtube.com/watch?v=…"
          onChange={(v) => onChange({ ...block, youtubeId: youtubeIdFrom(v) })}
          hint={block.youtubeId ? `ID ролика: ${block.youtubeId}` : "Вставте посилання — ID візьметься сам"}
        />
        <TextInput label="Назва (для доступності)" value={block.title} onChange={(title) => onChange({ ...block, title })} />
        <ImageInput
          label="Своя обкладинка (необовʼязково)"
          src={block.poster ?? ""}
          alt=""
          hideAlt
          onChange={({ src }) => onChange({ ...block, poster: src })}
        />
        <TextInput label="Підпис" value={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} />
      </>
    ),
  },
  callout: {
    component: ({ block, onChange }) => (
      <>
        <TextInput label="Заголовок" value={block.title ?? ""} onChange={(title) => onChange({ ...block, title })} />
        <RichTextarea label="Текст" value={block.text} onChange={(text) => onChange({ ...block, text })} />
      </>
    ),
  },
  divider: { component: DividerFields },
  button: {
    component: ({ block, onChange }) => (
      <>
        <div className="ed-row">
          <TextInput label="Текст кнопки" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <TextInput
            label="Посилання"
            value={block.href}
            placeholder="/#contact або https://…"
            onChange={(href) => onChange({ ...block, href })}
          />
        </div>
        <Checkbox
          label="Відкривати в новій вкладці"
          checked={!!block.external}
          onChange={(external) => onChange({ ...block, external })}
        />
      </>
    ),
  },
};
