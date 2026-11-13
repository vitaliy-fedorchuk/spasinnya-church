import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { BLOCKS } from "@/features/blog/blocks/registry";
import { BLOCK_GROUPS, BLOCK_INFO } from "@/features/blog/blocks/catalog";
import { SAMPLE_BLOCKS } from "@/features/blog/blocks/samples";
import ArticleBlocks from "@/features/blog/blocks/ArticleBlocks";
import "./preview-blocks.scss";

// Усі блоки зі стилями сайту — щоб побачити, як вони виглядають на телефоні,
// планшеті й комп'ютері (відкрити на будь-якому пристрої після входу в адмінку).

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Блоки статей", robots: { index: false, follow: false } };

export default async function PreviewBlocksPage() {
  await requireUser();

  return (
    <>
      <header className="pb-hero" data-surface="dark">
        <div className="container">
          <p className="pb-hero__label">Для адмінки</p>
          <h1 className="pb-hero__title">Блоки статей</h1>
          <p className="pb-hero__text">Так кожен блок виглядає на сайті. Відкрийте сторінку з телефона, щоб побачити мобільну версію.</p>
        </div>
      </header>

      <div className="container pb-body">
        {BLOCK_GROUPS.map((group) => (
          <section key={group.id} className="pb-group">
            <h2 className="pb-group__title">{group.label}</h2>
            {group.types.map((type) => (
              <div key={type} className="pb-item">
                <p className="pb-item__label">
                  {BLOCKS[type].label} <span>— {BLOCK_INFO[type].hint}</span>
                </p>
                <ArticleBlocks blocks={[SAMPLE_BLOCKS[type]]} />
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="preview-bar-lite">
        <a href="/admin/blocks">← До адмінки</a>
      </div>
    </>
  );
}
