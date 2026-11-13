import type { Metadata } from "next";
import Link from "next/link";
import { listAdminAuthors } from "@/server/admin/authors";
import { createAuthor } from "@/server/admin/author-actions";
import { variantOf } from "@/features/media/urls";
import { Icon } from "../icons";
import "./authors.scss";

export const metadata: Metadata = { title: "Автори" };

const plural = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? "стаття" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "статті" : "статей";

export default async function AuthorsPage() {
  const authors = await listAdminAuthors();

  return (
    <>
      <header className="a-page-head">
        <div>
          <h1 className="a-page-head__title">Автори</h1>
          <p className="authors__intro">
            Ті, хто підписує статті: імʼя, підпис, регалії й фото показуються на сайті.
          </p>
        </div>
        <form action={createAuthor}>
          <button type="submit" className="a-btn a-btn--primary">
            <Icon name="plus" />
            Новий автор
          </button>
        </form>
      </header>

      {authors.length === 0 ? (
        <div className="authors__empty">Авторів поки немає.</div>
      ) : (
        <ul className="authors__grid">
          {authors.map((a) => (
            <li key={a.id} className="authors__card">
              <span className="authors__photo">
                {a.photo ? <img src={variantOf(a.photo, 480)} alt="" /> : <Icon name="users" />}
              </span>
              <div className="authors__body">
                <Link className="authors__name" href={`/admin/authors/${a.id}`}>
                  {a.name}
                </Link>
                {a.role && <p className="authors__role">{a.role}</p>}
                {a.bio && <p className="authors__bio">{a.bio}</p>}
                <Link className="authors__count" href={`/admin/articles?author=${a.id}`}>
                  {a.articles} {plural(a.articles)}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
