import { useEffect, type RefObject } from "react";


/**
 * Стос карток, що наїжджають одна на одну знизу вгору (картки — position: sticky).
 *
 * Для кожної картки записує CSS-змінні:
 * - --cover (0…1) — наскільки її вже накрила наступна: стилі зменшують і притемнюють її;
 * - --reveal (0…1) — прозорість картки, що під'їжджає: біля нижнього краю екрана вона
 *   повністю прозора, а до свого місця в стосі плавно стає непрозорою.
 *
 * Пише одразу в style (без setState), щоб не перемальовувати React щокадру.
 */
export const useStackedCards = (listRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const cards = Array.from(list.children) as HTMLElement[];

      cards.forEach((card, i) => {
        const top = card.getBoundingClientRect().top;
        const height = card.offsetHeight;

        // Накриття наступною карткою
        const next = cards[i + 1];
        if (next) {
          const cover = 1 - (next.getBoundingClientRect().top - top) / height;
          card.style.setProperty("--cover", Math.min(Math.max(cover, 0), 1).toFixed(3));
        }

        // Поява: від низу екрана (прозора) до низу попередньої картки в стосі (непрозора).
        // Тобто проявляється лише над порожнім фоном, а на стос наїжджає вже суцільною —
        // без напівпрозорого накладання фото на фото.
        // Перша картка — завжди видна, щоб на старті секція виглядала як у макеті.
        if (i > 0) {
          const prev = cards[i - 1];
          const stackBottom = (parseFloat(getComputedStyle(prev).top) || 0) + prev.offsetHeight;
          // Якщо до низу екрана майже немає місця — проявляємось на коротшому відрізку
          const distance = Math.max(window.innerHeight - stackBottom, height * 0.3);
          const reveal = 1 - (top - stackBottom) / distance;
          card.style.setProperty("--reveal", Math.min(Math.max(reveal, 0), 1).toFixed(3));
        }
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [listRef]);
};
