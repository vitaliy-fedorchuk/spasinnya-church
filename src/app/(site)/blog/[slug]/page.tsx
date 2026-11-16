import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage, articleHref } from "@/features/blog";
import NewsSection from "@/components/sections/NewsSection";
import { describeArticle, getArticleBySlug, getRelatedArticles } from "@/server/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

// Як і головна — на кожен запит (див. src/app/page.tsx)
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getArticleBySlug(slug);
  if (!found) return {};

  const { article, seoTitle, seoDescription } = found;
  const title = seoTitle || article.title;
  const description = seoDescription || describeArticle(article);
  return {
    title,
    description,
    alternates: { canonical: articleHref(slug) },
    openGraph: {
      type: "article",
      title,
      description,
      url: articleHref(slug),
      publishedTime: article.date,
      authors: [article.author.name],
      tags: article.tags,
      images: [{ url: article.cover.src, alt: article.cover.alt }],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const found = await getArticleBySlug(slug);
  if (!found) notFound();

  // Не повторюємо блок головної, а пропонуємо, що почитати далі
  const more = await getRelatedArticles(found.article);

  return (
    <>
      <ArticlePage article={found.article} />
      {more.length > 0 && (
        <NewsSection
          articles={more}
          label="Читайте також"
          title={
            <>
              Ще з життя <span className="section-title__accent">нашої церкви</span>
            </>
          }
        />
      )}
    </>
  );
}
