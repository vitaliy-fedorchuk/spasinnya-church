import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminEvent, listEventPlaces } from "@/server/admin/events";
import EventForm from "./EventForm";
import "../events.scss";
// Поля форми (фото, підписи) — ті самі, що в редакторі статті
import "../../articles/[id]/editor.scss";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getAdminEvent((await params).id);
  return { title: e?.title ?? "Подія" };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const [event, places] = await Promise.all([getAdminEvent(id), listEventPlaces()]);
  if (!event) notFound();
  return <EventForm key={event.id} event={event} places={places} />;
}
