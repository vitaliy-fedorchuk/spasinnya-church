import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { getEventsSettings } from "@/server/events";
import SettingsForm from "./SettingsForm";
import "../events.scss";
import "../../articles/[id]/editor.scss";

export const metadata: Metadata = { title: "Налаштування блоку подій" };

export default async function EventsSettingsPage() {
  await requireUser();
  const settings = await getEventsSettings();
  return <SettingsForm initial={settings} />;
}
