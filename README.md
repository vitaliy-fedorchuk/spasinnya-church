# Церква Спасіння — сайт

Next.js 16 (App Router) · React 19 · TypeScript · SCSS

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшн-збірка (output: standalone — для VPS)
npm run start    # запустити зібране
npm run lint
```

## Структура

```
src/
  app/                 сторінки (App Router)
    layout.tsx         навбар + футер, загальні стилі й метадані
    page.tsx           головна
    blog/[slug]/       сторінка статті
  components/          секції головної, навбар, футер, кнопки
  features/
    blog/              статті: типи блоків, реєстр, компоненти блоків
    events-calendar/   календар подій
    navigation/        повноекранне меню
  styles/              _tools.scss (em(), брейкпоінти), global.scss
  assets/              картинки, іконки, шрифти
```

## Верстка

Усі розміри — через `em(px)` з `src/styles/_tools.scss` (резинова верстка від ширини
вікна). На телефоні `em()` дає чисті `vw`. Брейкпоінти: `tablet` ≤ 1199px,
`mobile` ≤ 767px.

## Статті (блоки)

Стаття — це шапка + масив блоків `{ id, type, ...поля }` (`src/features/blog/types.ts`).
Новий вид блоку: тип у `types.ts` → компонент у `blocks/` → рядок у `blocks/registry.ts`.
