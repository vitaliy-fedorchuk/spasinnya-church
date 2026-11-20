"use server";

import { requireUser } from "../auth/session";
import { saveChurchStatsRow } from "../church-stats";
import { churchStatsSchema, type ChurchStats } from "@/features/church-stats/stats";

export async function saveChurchStats(input: ChurchStats): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const parsed = churchStatsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Перевірте числа: лише цілі, від 0" };
  await saveChurchStatsRow(parsed.data);
  return { ok: true };
}
