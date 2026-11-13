import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/features/blog";
import { getArticleForPreview } from "@/server/admin/articles";
import "./preview.scss";

// Попередній перегляд статті з адмінки — будь-якої, і чернетки теж.
// Лише для тих, хто увійшов (getArticleForPreview → requireUser).

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Попередній перегляд", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getArticleForPreview(id);
  if (!found) notFound();

  return (
    <>
      <ArticlePage article={found.article} />
      <div className="preview-bar" role="status">
        <span>
          Попередній перегляд{found.status === "DRAFT" ? " · чернетка, на сайті її не видно" : ""}
        </span>
        <a href={`/admin/articles/${id}`}>← До редактора</a>
      </div>
    </>
  );
}
