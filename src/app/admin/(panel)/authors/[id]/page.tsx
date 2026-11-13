import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminAuthor } from "@/server/admin/authors";
import AuthorForm from "./AuthorForm";
import "../authors.scss";
// Поля форми (фото, підписи) — ті самі, що в редакторі статті
import "../../articles/[id]/editor.scss";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAdminAuthor((await params).id);
  return { title: a?.name ?? "Автор" };
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAdminAuthor((await params).id);
  if (!author) notFound();
  return <AuthorForm key={author.id} author={author} />;
}
