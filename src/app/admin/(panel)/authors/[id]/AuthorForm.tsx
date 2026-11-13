"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminAuthor } from "@/server/admin/authors";
import { deleteAuthor, saveAuthor } from "@/server/admin/author-actions";
import { variantOf } from "@/features/media/urls";
import { Icon } from "../../icons";
import { ImageInput, Textarea, TextInput } from "../../articles/[id]/fields";

const AuthorForm = ({ author }: { author: AdminAuthor }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: author.name, role: author.role, bio: author.bio, photo: author.photo });
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const patch = (p: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
    setMessage(null);
  };

  const save = () =>
    startTransition(async () => {
      const res = await saveAuthor(author.id, form);
      if (res.ok) {
        setDirty(false);
        setMessage({ text: "Збережено" });
        router.refresh();
      } else setMessage({ text: res.error, error: true });
    });

  const remove = () => {
    if (!window.confirm(`Видалити автора «${author.name}»?`)) return;
    startTransition(async () => {
      const res = await deleteAuthor(author.id);
      if (res && !res.ok) setMessage({ text: res.error, error: true });
    });
  };

  return (
    <div className="author-edit">
      <div className="ed-bar">
        <Link href="/admin/authors" className="ed-bar__back">
          <Icon name="back" />
          Автори
        </Link>
        <span className={`ed-bar__save ed-bar__save--${dirty ? "dirty" : "saved"}`}>
          {message?.text ?? (dirty ? "Є незбережені зміни" : "Усе збережено")}
        </span>
        <div className="ed-bar__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={save} disabled={pending || !dirty}>
            <Icon name="save" />
            Зберегти
          </button>
        </div>
      </div>

      {message?.error && (
        <div className="ed-issues" role="alert">
          {message.text}
        </div>
      )}

      <div className="author-edit__layout">
        <section className="ed-card">
          <h2 className="ed-card__title">Про автора</h2>
          <TextInput label="Імʼя та прізвище" value={form.name} maxLength={100} onChange={(name) => patch({ name })} />
          <TextInput
            label="Підпис під іменем"
            value={form.role}
            placeholder="Старший пастор"
            maxLength={100}
            hint="Видно в шапці статті та в картках новин"
            onChange={(role) => patch({ role })}
          />
          <Textarea
            label="Регалії / коротко про автора"
            value={form.bio}
            placeholder="Пастор церкви з 2005 року, магістр богословʼя…"
            hint={`${form.bio.length}/1000 · показується в картці «Про автора» в кінці статті`}
            rows={4}
            onChange={(bio) => patch({ bio: bio.slice(0, 1000) })}
          />
          <ImageInput label="Фото" src={form.photo} alt="" hideAlt onChange={({ src }) => patch({ photo: src })} />
        </section>

        <aside className="author-edit__side">
          <section className="ed-card">
            <h2 className="ed-card__title">Як виглядає</h2>
            <div className="author-preview">
              <span className="author-preview__photo">
                {form.photo ? <img src={variantOf(form.photo, 480)} alt="" /> : <Icon name="users" />}
              </span>
              <div>
                <p className="author-preview__name">{form.name || "Імʼя"}</p>
                <p className="author-preview__role">{form.role || "Підпис"}</p>
              </div>
            </div>
            {form.bio && <p className="author-preview__bio">{form.bio}</p>}
          </section>

          <section className="ed-card">
            <h2 className="ed-card__title">Статті</h2>
            <p className="ed-muted">
              {author.articles > 0 ? `Підписано статей: ${author.articles}` : "Статей поки немає"}
            </p>
            <button
              type="button"
              className="ed-link-btn ed-link-btn--danger"
              onClick={remove}
              disabled={pending || author.articles > 0}
              title={author.articles > 0 ? "Спершу призначте статтям іншого автора" : undefined}
            >
              <Icon name="trash" />
              Видалити автора
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AuthorForm;
