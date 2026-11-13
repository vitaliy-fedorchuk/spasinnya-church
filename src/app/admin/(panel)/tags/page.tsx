import type { Metadata } from "next";
import { listTags } from "@/server/admin/tags";
import TagsManager from "./TagsManager";
import "../articles/articles.scss";
import "./tags.scss";

export const metadata: Metadata = { title: "Теги" };

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <>
      <header className="a-page-head">
        <div>
          <h1 className="a-page-head__title">Теги</h1>
          <p className="tags__intro">
            Теги додаються в статтях. Тут їх можна перейменувати, обʼєднати схожі (виберіть кілька) або прибрати.
          </p>
        </div>
      </header>
      <TagsManager tags={tags} />
    </>
  );
}
