import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { queryMedia } from "@/server/media/library";
import MediaLibrary from "./MediaLibrary";
import "./media.scss";

export const metadata: Metadata = { title: "Медіатека" };

export default async function MediaPage() {
  await requireUser();
  const first = await queryMedia({});

  return (
    <>
      <header className="a-page-head">
        <h1 className="a-page-head__title">Медіатека</h1>
      </header>
      <MediaLibrary initialItems={first.items} initialCursor={first.nextCursor} />
    </>
  );
}
