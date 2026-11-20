import type { Metadata } from "next";
import ContactsPage from "@/features/contacts/ContactsPage";
import { getWeeklySchedule } from "@/server/events";

// Розклад — з подій в адмінці
export const dynamic = "force-dynamic";

const DESCRIPTION = "Як звʼязатися з церквою «Спасіння» в Підгайцях: електронна пошта, адреса і час богослужінь.";

export const metadata: Metadata = {
  title: "Контакти",
  description: DESCRIPTION,
  alternates: { canonical: "/kontakty" },
  openGraph: { type: "website", title: "Контакти церкви «Спасіння»", description: DESCRIPTION, url: "/kontakty" },
};

export default async function ContactsRoute() {
  return <ContactsPage schedule={await getWeeklySchedule()} />;
}
