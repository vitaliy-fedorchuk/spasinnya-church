/** Ключ дати "YYYY-MM-DD" (за місцевим календарем, без часових зсувів) */
export const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Сьогоднішня дата в потрібному часовому поясі (щоб «сьогодні» було київським) */
export const getToday = (timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get("year"), get("month") - 1, get("day"));
};

export const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

/** Номер дня тижня, де понеділок = 0 … неділя = 6 */
export const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;

/**
 * Клітинки місяця, тиждень починається з понеділка.
 * null — порожня клітинка до/після місяця. Рядків рівно стільки, скільки потрібно (4–6).
 */
export const getMonthCells = (month: Date): (Date | null)[] => {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = mondayIndex(first);
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= daysInMonth ? new Date(first.getFullYear(), first.getMonth(), day) : null;
  });
};
