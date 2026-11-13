import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { BLOCKS } from "@/features/blog/blocks/registry";
import { BLOCK_GROUPS, BLOCK_INFO } from "@/features/blog/blocks/catalog";
import { SAMPLE_BLOCKS } from "@/features/blog/blocks/samples";
import ArticleBlocks from "@/features/blog/blocks/ArticleBlocks";
import { BLOCK_ICON, Icon } from "../icons";
import "./catalog.scss";

export const metadata: Metadata = { title: "Блоки" };

/**
 * Каталог блоків: усі види з живими прикладами (ті самі компоненти, що на сайті)
 * і порадами, коли який використовувати.
 */
export default async function BlocksCatalogPage() {
  await requireUser();

  return (
    <>
      <header className="a-page-head">
        <div>
          <h1 className="a-page-head__title">Блоки</h1>
          <p className="catalog__intro">
            З цих блоків складається кожна стаття. Нижче — як кожен виглядає на сайті й коли його використовувати.
          </p>
        </div>
        <a className="a-btn a-btn--ghost" href="/preview/blocks" target="_blank" rel="noreferrer">
          <Icon name="eye" />
          Як на сайті (і на телефоні)
        </a>
      </header>

      <nav className="catalog__toc" aria-label="Групи блоків">
        {BLOCK_GROUPS.map((g) => (
          <a key={g.id} href={`#group-${g.id}`} className="catalog__toc-link">
            {g.label}
          </a>
        ))}
      </nav>

      {BLOCK_GROUPS.map((group) => (
        <section key={group.id} id={`group-${group.id}`} className="catalog__group">
          <h2 className="catalog__group-title">{group.label}</h2>

          {group.types.map((type) => (
            <article key={type} className="catalog__item">
              <div className="catalog__info">
                <span className="catalog__icon">
                  <Icon name={BLOCK_ICON[type]} />
                </span>
                <div>
                  <h3 className="catalog__name">{BLOCKS[type].label}</h3>
                  <p className="catalog__hint">{BLOCK_INFO[type].hint}</p>
                  <p className="catalog__when">{BLOCK_INFO[type].when}</p>
                </div>
              </div>
              <div className="catalog__stage">
                <ArticleBlocks blocks={[SAMPLE_BLOCKS[type]]} />
              </div>
            </article>
          ))}
        </section>
      ))}
    </>
  );
}
