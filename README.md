# Церква Спасіння — сайт

Next.js 16 (App Router) · React 19 · TypeScript · SCSS

## Запуск

Потрібні Node.js 24 і Docker Desktop (для локальної бази PostgreSQL).

```bash
cp .env.example .env   # налаштування (у git не потрапляє)
npm install            # заодно генерує клієнт Prisma
npm run db:up          # PostgreSQL 18 у Docker
npm run db:migrate     # створити/оновити таблиці
npm run db:seed        # демо-автор і статті (+ фото в uploads/demo)
npm run dev            # http://localhost:3000
npm run build    # продакшн-збірка (output: standalone — для VPS)
npm run start    # запустити зібране
npm run lint
```

## База даних

PostgreSQL + Prisma 7. Схема — `prisma/schema.prisma`, міграції — `prisma/migrations` (в git).

```bash
npm run db:migrate -- --name <що змінилось>   # після зміни схеми
npm run db:studio                              # переглянути/поправити дані в браузері
```

Блоки статті зберігаються в колонці `blocks` (JSONB). Їхню структуру перевіряють zod-схеми
з `src/features/blog/types.ts` — і при збереженні, і при читанні.
Завантажені фото лежать у `UPLOADS_DIR` і віддаються за адресою `/uploads/...`.

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
  server/              тільки серверний код: підключення до бази, запити
  generated/prisma/    згенерований клієнт Prisma (не в git)
  styles/              _tools.scss (em(), брейкпоінти), global.scss
  assets/              картинки, іконки, шрифти
```

## Верстка

Усі розміри — через `em(px)` з `src/styles/_tools.scss` (резинова верстка від ширини
вікна). На телефоні `em()` дає чисті `vw`. Брейкпоінти: `tablet` ≤ 1199px,
`mobile` ≤ 767px.

## Статті (блоки)

Стаття — це шапка + масив блоків `{ id, type, ...поля }` (`src/features/blog/types.ts`).
Новий вид блоку: zod-схема в `types.ts` → компонент у `blocks/` → рядок у `blocks/registry.ts`.
Міграція бази для цього не потрібна.
