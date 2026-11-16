import type { Metadata } from "next";
import { cookies } from "next/headers";
import BlogArchivePage from "@/features/blog-archive/BlogArchivePage";
import { archiveHref, monthTitle, parseArchiveParams, VIEW_COOKIE } from "@/features/blog-archive/params";
import { getBlogArchive } from "@/server/blog-archive";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Як і головна — на кожен запит (див. src/app/(site)/page.tsx)
export const dynamic = "force-dynamic";

const DESCRIPTION = "Новини, події й свідчення церкви «Спасіння» — за датами, рубриками й авторами.";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = parseArchiveParams(await searchParams);
  const parts = [p.tag, p.month && monthTitle(p.month)].filter(Boolean);
  const title = parts.length ? `${parts.join(", ")} — Часопис новин` : "Часопис новин";
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: archiveHref({ tag: p.tag, month: p.month }, {}) },
    // Пошук і комбінації фільтрів не індексуємо — лише саму стрічку, рубрики й місяці
    robots: p.q || p.author || p.n ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", title, description: DESCRIPTION, url: "/blog" },
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const p = parseArchiveParams(await searchParams);
  const [data, jar] = await Promise.all([getBlogArchive(p), cookies()]);
  const view = jar.get(VIEW_COOKIE)?.value === "grid" ? "grid" : "list";
  const authorName = p.author ? data.authors.find((a) => a.id === p.author)?.name : undefined;

  return <BlogArchivePage params={p} data={data} view={view} authorName={authorName} />;
}
