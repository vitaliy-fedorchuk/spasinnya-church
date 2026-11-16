/** Адреса сторінки статті */
export const articleHref = (slug: string) => `/blog/${slug}`;

/** «Олена Ковальчук» → «ОК» — замість фото автора, поки його немає */
export const authorInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
