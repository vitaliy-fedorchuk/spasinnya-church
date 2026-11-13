import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleForEditor, listAuthors } from "@/server/admin/articles";
import ArticleEditor from "./ArticleEditor";
import "./editor.scss";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getArticleForEditor((await params).id);
  return { title: found?.article.title || "Нова стаття" };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [found, authors] = await Promise.all([getArticleForEditor(id), listAuthors()]);
  if (!found) notFound();

  return (
    <ArticleEditor
      // key: після переходу на іншу статтю редактор починає з чистого стану
      key={found.id}
      id={found.id}
      initialStatus={found.status}
      initialArticle={found.article}
      authors={authors}
    />
  );
}
