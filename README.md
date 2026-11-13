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

## Адмінка

`/admin` — вхід за поштою й паролем. Користувача створює (або скидає йому пароль) скрипт:

```bash
npm run admin:create -- --email you@example.com --name "Імʼя" [--role ADMIN|EDITOR]
```

Без `--password` генерується надійний пароль і показується один раз.

Безпека: паролі — argon2id; сесія — випадковий токен у httpOnly-cookie (у базі лише його
SHA-256); 5 невдалих спроб на пошту / 20 на IP за 15 хв → блок. `src/proxy.ts` не пускає
в `/admin` без cookie, а справжню перевірку робить `requireUser()` — її треба викликати
в кожній сторінці та дії адмінки.

### Редактор статей

`/admin/articles` → «Нова стаття» або назва статті. Чернетка зберігається сама (через 1,5 с
після змін, або Ctrl+S); опублікована — лише кнопкою «Оновити» і лише якщо проходить повну
перевірку. Дата публікації в майбутньому = запланована стаття. «Переглянути» відкриває
`/preview/<id>` — сторінку як на сайті, навіть для чернетки.

Форми блоків — `src/app/admin/(panel)/articles/[id]/BlockFields.tsx` (парний реєстр до
`blocks/registry.ts`). Спільна логіка редактора й сервера — `src/features/blog/editor.ts`.

### Медіатека

`/admin/media` і кнопки «Завантажити» / «Медіатека» в кожному полі фото редактора.
Завантаження (`POST /api/admin/media`) → `sharp`: перевірка, що це справді фото, поворот
за EXIF, видалення EXIF/GPS, 4 розміри webp (480, 960, 1600, 2400) у
`UPLOADS_DIR/<рік>/<місяць>/<id>-<ширина>.webp`. У статтях зберігається адреса `-1600`,
сайт сам додає `srcset` (`src/features/media/urls.ts`). Фото, що десь використане,
видалити не можна.

## Структура

```
src/
  app/                 сторінки (App Router)
    layout.tsx         спільна оболонка (html/body, шрифти, метадані)
    (site)/            публічний сайт: layout з навбаром і футером, головна, blog/[slug]
    admin/             адмінка: login/, (panel)/ — сторінки після входу
    uploads/           віддача завантажених фото
  proxy.ts             перший фільтр для /admin
  components/          секції головної, навбар, футер, кнопки
  features/
    blog/              статті: типи блоків, реєстр, компоненти блоків
    events-calendar/   календар подій
    navigation/        повноекранне меню
  server/              тільки серверний код: база, запити, auth/ (вхід, сесії), admin/
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
Новий вид блоку: zod-схема в `types.ts` → компонент у `blocks/` → рядок у `blocks/registry.ts`
→ порожній блок у `createBlock()` (`editor.ts`) → форма в `BlockFields.tsx`. TypeScript підкаже,
якщо щось пропущено.
Міграція бази для цього не потрібна.
