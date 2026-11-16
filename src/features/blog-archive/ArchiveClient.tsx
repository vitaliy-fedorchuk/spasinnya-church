"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { VIEW_COOKIE, type ArchiveView } from "./params";

// Запис cookie — поза компонентом (правило React Compiler про побічні ефекти)
const saveView = (view: ArchiveView) => {
  document.cookie = `${VIEW_COOKIE}=${view}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
};

/** Перемикач «Список / Картки»: запамʼятовуємо вибір і перемальовуємо сторінку на сервері */
export const ViewToggle = ({ view }: { view: ArchiveView }) => {
  const router = useRouter();
  const choose = (next: ArchiveView) => {
    if (next === view) return;
    saveView(next);
    router.refresh();
  };

  return (
    <div className="archive-view" role="group" aria-label="Вигляд">
      <button type="button" aria-pressed={view === "list"} onClick={() => choose("list")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        <span>Список</span>
      </button>
      <button type="button" aria-pressed={view === "grid"} onClick={() => choose("grid")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect width="7" height="7" x="3" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="3" y="14" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" />
        </svg>
        <span>Картки</span>
      </button>
    </div>
  );
};

// ---------- Фільтри на телефоні й планшеті: панель знизу ----------

const SheetContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export const FiltersSheetProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
};

export const FiltersButton = ({ active }: { active: number }) => {
  const { setOpen } = useContext(SheetContext);
  return (
    <button type="button" className="archive-filters-btn" onClick={() => setOpen(true)} aria-controls="archive-filters">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18M7 12h10M10 18h4" />
      </svg>
      Фільтри
      {active > 0 && <span className="archive-filters-btn__count">{active}</span>}
    </button>
  );
};

/**
 * Бічна панель. На десктопі — звичайна колонка, на телефоні й планшеті —
 * панель, що виїжджає знизу. Клік по будь-якому фільтру закриває її.
 */
export const FiltersPanel = ({ children }: { children: ReactNode }) => {
  const { open, setOpen } = useContext(SheetContext);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div className={`archive-sheet-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        id="archive-filters"
        className={`archive-aside${open ? " is-open" : ""}`}
        aria-label="Фільтри"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <div className="archive-aside__sheet-head">
          <span className="archive-aside__grip" aria-hidden="true" />
          <b>Фільтри</b>
          <button type="button" className="archive-aside__close" onClick={() => setOpen(false)} aria-label="Закрити фільтри">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </aside>
    </>
  );
};
