import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import LoginForm from "./LoginForm";
import Logo from "../(panel)/Logo";
import "./login.scss";

export const metadata: Metadata = { title: "Вхід" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Уже увійшли — одразу в адмінку
  if (await getCurrentUser()) redirect("/admin");

  const { next } = await searchParams;

  return (
    <main className="login">
      <div className="login__card">
        <Logo className="login__logo" />
        <h1 className="login__title">Адмінпанель блогу</h1>
        <LoginForm next={next} />
      </div>
      <a className="login__back" href="/">
        ← На сайт
      </a>
    </main>
  );
}
