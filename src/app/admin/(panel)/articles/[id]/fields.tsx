"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { variantOf, type MediaItem } from "@/features/media/urls";
import { ACCEPT_IMAGES } from "@/features/media/upload";
import MediaPicker from "../../media/MediaPicker";
import { UploadList, useUploads } from "../../media/useUploads";

/** Підпис + поле + підказка/помилка */
export const Field = ({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) => (
  <div className={`ed-field ${error ? "ed-field--error" : ""}`.trim()}>
    <label className="ed-field__label" htmlFor={htmlFor}>
      {label}
    </label>
    {children}
    {error ? <p className="ed-field__error">{error}</p> : hint && <p className="ed-field__hint">{hint}</p>}
  </div>
);

export const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  maxLength?: number;
}) => {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        className="ed-input"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
};

/**
 * Текст із кнопками форматування. Зберігається простим форматом,
 * який розуміє сайт: **жирний**, *курсив*, [текст](посилання).
 */
export const RichTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  large,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
  large?: boolean;
}) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Обгортає виділений текст (або вставляє зразок) і повертає виділення */
  const wrap = (before: string, after: string, sample: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || sample;
    onChange(value.slice(0, s) + before + selected + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  const addLink = () => {
    const url = window.prompt("Адреса посилання (https://… або /#contact)");
    if (url) wrap("[", `](${url.trim()})`, "текст посилання");
  };

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="ed-rich">
        <div className="ed-rich__toolbar" role="toolbar" aria-label="Форматування">
          <button type="button" className="ed-rich__btn" onClick={() => wrap("**", "**", "жирний")} title="Жирний">
            <b>Ж</b>
          </button>
          <button type="button" className="ed-rich__btn" onClick={() => wrap("*", "*", "курсив")} title="Курсив">
            <i>К</i>
          </button>
          <button type="button" className="ed-rich__btn" onClick={addLink} title="Посилання">
            🔗
          </button>
        </div>
        <textarea
          id={id}
          ref={ref}
          className={`ed-input ed-textarea ${large ? "ed-textarea--large" : ""}`.trim()}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Field>
  );
};

export const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
}) => {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className="ed-input ed-textarea"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
};

export const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="ed-check">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

/**
 * Фото: завантажити / вибрати з медіатеки / перетягнути файл на мініатюру.
 * Адресу вручну теж можна вписати (сховано під «Адреса вручну»).
 */
export const ImageInput = ({
  label,
  src,
  alt,
  onChange,
  error,
  hideAlt,
}: {
  label: string;
  src: string;
  alt: string;
  onChange: (v: { src: string; alt: string }) => void;
  error?: string;
  /** Без поля опису (напр. обкладинка відео) */
  hideAlt?: boolean;
}) => {
  const id = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Опис з медіатеки підставляємо, лише якщо тут його ще не задали
  const take = (item: MediaItem) => onChange({ src: item.url, alt: alt.trim() ? alt : item.alt });
  const { tasks, start, dismiss } = useUploads(take);
  const uploading = tasks.some((t) => !t.error);

  return (
    <div className={`ed-image ${error ? "ed-image--error" : ""}`.trim()}>
      <button
        type="button"
        className={`ed-image__preview ${dragOver ? "is-drag-over" : ""}`.trim()}
        onClick={() => setPickerOpen(true)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
          if (file) start([file]);
        }}
        title="Вибрати фото або перетягнути файл сюди"
      >
        {src ? <img src={variantOf(src, 480)} alt="" /> : <span>{uploading ? "Завантаження…" : "Перетягніть фото сюди"}</span>}
      </button>

      <div className="ed-image__fields">
        <span className="ed-field__label">{label}</span>
        <div className="ed-image__buttons">
          <label className="a-btn a-btn--ghost ed-image__btn">
            {uploading ? "Завантаження…" : "Завантажити"}
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              hidden
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) start([file]);
                e.target.value = "";
              }}
            />
          </label>
          <button type="button" className="a-btn a-btn--ghost ed-image__btn" onClick={() => setPickerOpen(true)}>
            Медіатека
          </button>
          {src && (
            <button type="button" className="ed-link-btn ed-link-btn--danger" onClick={() => onChange({ src: "", alt })}>
              Прибрати
            </button>
          )}
        </div>

        <UploadList tasks={tasks} onDismiss={dismiss} />
        {error && <p className="ed-field__error">{error}</p>}

        {!hideAlt && (
          <input
            className="ed-input ed-input--small"
            value={alt}
            placeholder="Що на фото (для незрячих і пошуку)"
            aria-label="Опис фото"
            onChange={(e) => onChange({ src, alt: e.target.value })}
          />
        )}

        <details className="ed-image__manual">
          <summary>Адреса вручну</summary>
          <input
            id={id}
            className="ed-input ed-input--small"
            value={src}
            placeholder="/uploads/… або https://…"
            aria-label="Адреса фото"
            onChange={(e) => onChange({ src: e.target.value, alt })}
          />
        </details>
      </div>

      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={(item) => {
            take(item);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};
