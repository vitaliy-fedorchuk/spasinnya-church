import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES, ArticlePage, articleHref, getArticle } from "../../../features/blog";
import NewsSection from "../../../components/sections/NewsSection";

interface Props {
  params: Promise<{ slug: string }>;
}

// Сторінки статей будуються заздалегідь (статичний HTML).
// Поки статті в коді — невідомі адреси дають 404.
// TODO (етап 2): брати з бази + revalidatePath після публікації
export const dynamicParams = false;

export const generateStaticParams = () => ARTICLES.map(({ slug }) => ({ slug }));

/** Опис для пошуку й соцмереж — перший вступний або текстовий абзац */
const describe = (slug: string) => {
  const article = getArticle(slug);
  const first = article?.blocks.find((b) => b.type === "lead" || b.type === "text");
  const text = first?.type === "lead" ? first.text : first?.type === "text" ? first.paragraphs[0] : "";
  // Прибираємо розмітку **жирний**, *курсив*, [посилання](url)
  return text
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\*+/g, "")
    .slice(0, 200);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const description = describe(slug);
  return {
    title: article.title,
    description,
    alternates: { canonical: articleHref(slug) },
    openGraph: {
      type: "article",
      title: article.title,
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
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <ArticlePage article={article} />
      <NewsSection exclude={article.slug} />
    </>
  );
}
