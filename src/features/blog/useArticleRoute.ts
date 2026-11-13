import { useEffect, useLayoutEffect, useState } from "react";

const PREFIX = "#/blog/";

const readSlug = () =>
  window.location.hash.startsWith(PREFIX)
    ? decodeURIComponent(window.location.hash.slice(PREFIX.length))
    : null;

/**
 * Найпростіший роутинг без бібліотек (сайт живе на GitHub Pages):
 * #/blog/<slug> — сторінка статті, будь-що інше — головна.
 * Повертає slug статті або null.
 */
export const useArticleRoute = () => {
  const [slug, setSlug] = useState(readSlug);

  useEffect(() => {
    const onChange = () => setSlug(readSlug());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Після зміни сторінки: стаття — з самого верху;
  // головна з якорем (#news) — до потрібної секції (браузер не знайшов її
  // сам, бо на момент зміни адреси секції ще не було на сторінці)
  useLayoutEffect(() => {
    if (slug) {
      window.scrollTo(0, 0);
      return;
    }
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [slug]);

  return slug;
};
