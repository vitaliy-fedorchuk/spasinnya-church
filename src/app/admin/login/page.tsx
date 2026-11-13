import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import LoginForm from "./LoginForm";
import "./login.scss";

export const metadata: Metadata = { title: "Вхід" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Уже увійшли — одразу в адмінку
  if (await getCurrentUser()) redirect("/admin");

  const { next } = await searchParams;

  return (
    <main className="login">
      <div className="login__card">
        <p className="login__brand">Церква Спасіння</p>
        <h1 className="login__title">Вхід в адмінку</h1>
        <LoginForm next={next} />
      </div>
      <a className="login__back" href="/">
        ← На сайт
      </a>
    </main>
  );
}
