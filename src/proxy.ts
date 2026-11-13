import { NextResponse, type NextRequest } from "next/server";

/**
 * Перший фільтр для /admin: без cookie сесії — одразу на сторінку входу.
 * Це лише швидка перевірка «чи є cookie взагалі». Справжня (чи сесія жива,
 * хто користувач) — у requireUser() на кожній сторінці й дії адмінки.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasSession = req.cookies.has("spas_session");

  if (!isLogin && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  // Пошуковикам — не індексувати адмінку
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
