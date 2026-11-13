import { redirect } from "next/navigation";

// Поки що головна адмінки — список статей
export default function AdminHome() {
  redirect("/admin/articles");
}
