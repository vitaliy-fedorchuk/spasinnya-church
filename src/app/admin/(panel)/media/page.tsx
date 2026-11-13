import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { mediaPeriods, mediaStats, queryAlbums } from "@/server/media/library";
import MediaLibrary from "./MediaLibrary";
import "../articles/articles.scss";
import "../tags/tags.scss";
import "./media.scss";

export const metadata: Metadata = { title: "Медіатека" };

export default async function MediaPage() {
  await requireUser();
  const [albums, stats, periods] = await Promise.all([queryAlbums(), mediaStats(), mediaPeriods()]);

  return (
    <>
      <header className="a-page-head">
        <h1 className="a-page-head__title">Медіатека</h1>
      </header>
      <MediaLibrary initialOverview={{ albums, stats, periods }} />
    </>
  );
}
