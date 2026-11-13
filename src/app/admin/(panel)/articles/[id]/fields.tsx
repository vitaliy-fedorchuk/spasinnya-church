"use client";

import { useId, useRef, type ReactNode } from "react";

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
 * Фото: адреса + опис. Поки що адресою (/uploads/… або https://…);
 * на етапі 5 тут зʼявиться завантаження й вибір із медіатеки.
 */
export const ImageInput = ({
  label,
  src,
  alt,
  onChange,
  error,
}: {
  label: string;
  src: string;
  alt: string;
  onChange: (v: { src: string; alt: string }) => void;
  error?: string;
}) => {
  const id = useId();
  return (
    <div className={`ed-image ${error ? "ed-image--error" : ""}`.trim()}>
      <div className="ed-image__preview">
        {src ? (
          <img src={src} alt="" />
        ) : (
          <span>Немає фото</span>
        )}
      </div>
      <div className="ed-image__fields">
        <Field label={label} error={error} htmlFor={id}>
          <input
            id={id}
            className="ed-input"
            value={src}
            placeholder="/uploads/… або https://…"
            onChange={(e) => onChange({ src: e.target.value, alt })}
          />
        </Field>
        <input
          className="ed-input ed-input--small"
          value={alt}
          placeholder="Що на фото (для незрячих і пошуку)"
          aria-label="Опис фото"
          onChange={(e) => onChange({ src, alt: e.target.value })}
        />
      </div>
    </div>
  );
};
