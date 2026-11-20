import "server-only";
import { cache } from "react";
import type { Prisma } from "../generated/prisma/client";
import { db } from "./db";
import { churchStatsSchema, DEFAULT_CHURCH_STATS, type ChurchStats } from "@/features/church-stats/stats";

const KEY = "churchStats";

/** Числа церкви (з типовими значеннями, якщо ще не зберігали) */
export const getChurchStats = cache(async (): Promise<ChurchStats> => {
  const row = await db.siteSetting.findUnique({ where: { key: KEY } });
  const parsed = churchStatsSchema.partial().safeParse(row?.value ?? {});
  return { ...DEFAULT_CHURCH_STATS, ...(parsed.success ? parsed.data : {}) };
});

export const saveChurchStatsRow = (value: ChurchStats) =>
  db.siteSetting.upsert({
    where: { key: KEY },
    update: { value: value as unknown as Prisma.InputJsonValue },
    create: { key: KEY, value: value as unknown as Prisma.InputJsonValue },
  });
