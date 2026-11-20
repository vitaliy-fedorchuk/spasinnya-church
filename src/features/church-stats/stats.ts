import { z } from "zod";

/**
 * «Цифри» — одне місце для чисел, які показуються на сайті
 * (головна — «312 членів церкви», сторінка «Історія церкви»).
 * Редагуються в адмінці: «Цифри». 0 — число не показувати.
 */
const count = z.number().int().min(0).max(100_000);

export const churchStatsSchema = z.object({
  members: count,
  children: count,
  teens: count,
  youth: count,
  pastors: count,
  deacons: count,
  /** Підпис «станом на…» — напр. «листопад 2026»; порожньо — без підпису */
  asOf: z.string().trim().max(40),
});

export type ChurchStats = z.infer<typeof churchStatsSchema>;

export const DEFAULT_CHURCH_STATS: ChurchStats = {
  members: 312,
  // TODO: тимчасові числа — точні впише церква в адмінці (підлітки + молодь = 198)
  children: 64,
  teens: 72,
  youth: 126,
  pastors: 1,
  deacons: 5,
  asOf: "",
};

/** Відмінок слова після числа: 1 член, 2 члени, 5 членів */
export const plural = (n: number, one: string, few: string, many: string) => {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
};
