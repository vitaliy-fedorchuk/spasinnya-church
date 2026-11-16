import type { Metadata } from "next";
import FirstVisitPage from "@/features/first-visit/FirstVisitPage";
import { getWeeklySchedule } from "@/server/events";

// Розклад береться з подій в адмінці — тож на кожен запит, як і головна
export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Вперше в Церкві Спасіння? Як проходить богослужіння, що варто знати перед першим візитом, розклад і як нас знайти.";

export const metadata: Metadata = {
  title: "Я тут вперше",
  description: DESCRIPTION,
  alternates: { canonical: "/ya-tut-vpershe" },
  openGraph: { type: "website", title: "Я тут вперше — давайте знайомитись", description: DESCRIPTION, url: "/ya-tut-vpershe" },
};

export default async function FirstVisitRoute() {
  const schedule = await getWeeklySchedule();
  return <FirstVisitPage schedule={schedule} />;
}
