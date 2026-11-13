import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage, articleHref } from "@/features/blog";
import NewsSection from "@/components/sections/NewsSection";
import { describeArticle, getArticleBySlug, getLatestArticles } from "@/server/articles";

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

  const more = await getLatestArticles({ limit: 3, excludeSlug: slug });

  return (
    <>
      <ArticlePage article={found.article} />
      <NewsSection articles={more} />
    </>
  );
}
