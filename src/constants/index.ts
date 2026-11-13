/** Адреса церкви — одна для футера, календаря подій і кнопок «Прокласти маршрут» */
export const CHURCH_ADDRESS = "вул. Дубнівська, 1 В, с. Підгайці, Україна";

/** Пошук адреси на карті */
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_ADDRESS)}`;

/** Маршрут до церкви від місця, де зараз людина */
export const ROUTE_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CHURCH_ADDRESS)}`;
