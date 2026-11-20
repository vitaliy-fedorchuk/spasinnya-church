import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import LoginForm from "./LoginForm";
import Logo from "../(panel)/Logo";
import { srcSetOf } from "@/features/media/urls";
import "./login.scss";

export const metadata: Metadata = { title: "Вхід" };

// Фото будівлі церкви з медіатеки
const PHOTO = "/uploads/2026/01/demo-church-1600.webp";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Уже увійшли — одразу в адмінку
  if (await getCurrentUser()) redirect("/admin");

  const { next } = await searchParams;

  return (
    <main className="login">
      {/* Ліворуч — фото церкви (на телефоні — смуга зверху) */}
      <div className="login__photo">
        <img src={PHOTO} srcSet={srcSetOf(PHOTO)} sizes="(max-width: 767px) 100vw, 50vw" alt="" />
        <p className="login__caption">
          <b>Церква «Спасіння»</b>
          с. Підгайці
        </p>
      </div>

      {/* Праворуч — форма */}
      <div className="login__side">
        <div className="login__card">
          <Logo className="login__logo" />
          <h1 className="login__title">Адмінпанель</h1>
          <LoginForm next={next} />
        </div>
        <a className="login__back" href="/">
          ← На сайт
        </a>
      </div>
    </main>
  );
}
