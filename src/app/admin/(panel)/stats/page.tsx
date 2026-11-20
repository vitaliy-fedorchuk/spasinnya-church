import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { getChurchStats } from "@/server/church-stats";
import StatsForm from "./StatsForm";
import "../events/events.scss";
import "../articles/[id]/editor.scss";
import "./stats.scss";

export const metadata: Metadata = { title: "Цифри" };

export default async function ChurchStatsPage() {
  await requireUser();
  return <StatsForm initial={await getChurchStats()} />;
}
