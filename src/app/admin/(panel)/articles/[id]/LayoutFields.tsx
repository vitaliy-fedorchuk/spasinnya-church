"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  DIVIDER_STYLES,
  galleryLayoutOf,
  GALLERY_LAYOUTS,
  type DividerBlock,
  type DividerStyle,
  type GalleryBlock,
  type GalleryLayout,
} from "@/features/blog/types";
import type { MediaItem } from "@/features/media/urls";
import { ACCEPT_IMAGES } from "@/features/media/upload";
import LogoMark from "@/components/ui/LogoMark";
import { UploadList, useUploads } from "../../media/useUploads";
import { Icon } from "../../icons";
import { Field, ImageInput, TextInput } from "./fields";

const MAX_PHOTOS = 6;

// ---------- Схема розкладки (мініатюра на кнопці) ----------

/** [колонка, рядок, ширина, висота] у клітинках сітки */
type Cell = [number, number, number?, number?];
interface Spec {
  cols: number[];
  rows: number;
  cells: Cell[];
}

/** Ті самі розкладки, що в blocks.scss — лише схематично */
const specOf = (layout: GalleryLayout, n: number): Spec => {
  const even = (cols: number, rows: number): Spec => ({
    cols: Array(cols).fill(1),
    rows,
    cells: Array.from({ length: n }, (_, i) => [i % cols, Math.floor(i / cols)] as Cell),
  });
  if (layout === "row") return even(n, 1);
  if (layout === "featured") {
    if (n === 2) return { cols: [2, 1], rows: 1, cells: [[0, 0], [1, 0]] };
    if (n === 3) return { cols: [2, 1], rows: 2, cells: [[0, 0, 1, 2], [1, 0], [1, 1]] };
    if (n === 4) return { cols: [2, 1], rows: 3, cells: [[0, 0, 1, 3], [1, 0], [1, 1], [1, 2]] };
    if (n === 5) return { cols: [2, 1, 1], rows: 2, cells: [[0, 0, 1, 2], [1, 0], [2, 0], [1, 1], [2, 1]] };
    return { cols: [1, 1, 1], rows: 3, cells: [[0, 0, 2, 2], [2, 0], [2, 1], [0, 2], [1, 2], [2, 2]] };
  }
  if (n === 5) return { cols: Array(6).fill(1), rows: 2, cells: [[0, 0, 3], [3, 0, 3], [0, 1, 2], [2, 1, 2], [4, 1, 2]] };
  if (n === 3 || n === 6) return even(3, n / 3);
  return even(2, Math.ceil(n / 2));
};

const Schematic = ({ layout, count }: { layout: GalleryLayout; count: number }) => {
  const { cols, rows, cells } = specOf(layout, count);
  const W = 60;
  const H = 40;
  const gap = 2;
  const total = cols.reduce((a, b) => a + b, 0);
  const colX = (c: number) => (cols.slice(0, c).reduce((a, b) => a + b, 0) / total) * (W + gap);
  const colW = (c: number, span: number) => (cols.slice(c, c + span).reduce((a, b) => a + b, 0) / total) * (W + gap) - gap;
  const rowH = (H + gap) / rows;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ed-layout-pick__svg" aria-hidden="true">
      {cells.map(([c, r, cs = 1, rs = 1], i) => (
        <rect key={i} x={colX(c)} y={r * rowH} width={colW(c, cs)} height={rs * rowH - gap} rx="2" />
      ))}
    </svg>
  );
};

const LAYOUT_LABEL: Record<GalleryLayout, string> = { grid: "Сітка", featured: "Головне фото", row: "В один ряд" };

// ---------- Галерея ----------

export const GalleryFields = ({ block, onChange }: { block: GalleryBlock; onChange: (b: GalleryBlock) => void }) => {
  const count = block.images.length;
  const layout = galleryLayoutOf(count, block.layout);

  // Кілька фото вантажаться паралельно — беремо найсвіжіший стан блоку, а не той, що був на початку
  const latest = useRef(block);
  useEffect(() => {
    latest.current = block;
  }, [block]);

  const onUploaded = useCallback(
    (item: MediaItem) => {
      const b = latest.current;
      const empty = b.images.findIndex((img) => !img.src);
      const photo = { src: item.url, alt: item.alt };
      let images = b.images;
      if (empty >= 0) images = images.map((img, i) => (i === empty ? photo : img));
      else if (images.length < MAX_PHOTOS) images = [...images, photo];
      else return;
      const next = { ...b, images };
      latest.current = next;
      onChange(next);
    },
    [onChange],
  );
  const { tasks, start, dismiss } = useUploads(onUploaded);

  const setImage = (i: number, img: { src: string; alt: string }) =>
    onChange({ ...block, images: block.images.map((x, j) => (j === i ? img : x)) });

  const free = MAX_PHOTOS - block.images.filter((img) => img.src).length;

  return (
    <>
      <Field label="Розкладка" hint="На телефоні будь-яка розкладка — стрічка, що гортається вбік">
        <div className="ed-layout-pick" role="radiogroup" aria-label="Розкладка галереї">
          {GALLERY_LAYOUTS.map((l) => {
            const disabled = l === "row" && count > 4;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={layout === l}
                disabled={disabled}
                title={disabled ? "В один ряд — для 2–4 фото" : LAYOUT_LABEL[l]}
                className={`ed-layout-pick__btn ${layout === l ? "is-active" : ""}`.trim()}
                onClick={() => onChange({ ...block, layout: l })}
              >
                <Schematic layout={l} count={count} />
                <span>{LAYOUT_LABEL[l]}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {block.images.map((img, i) => (
        <div key={i} className="ed-gallery-item">
          <ImageInput label={`Фото ${i + 1}`} src={img.src} alt={img.alt} onChange={(v) => setImage(i, v)} />
          {count > 2 && (
            <button
              type="button"
              className="ed-link-btn ed-link-btn--danger"
              onClick={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })}
            >
              <Icon name="trash" />
              Прибрати фото
            </button>
          )}
        </div>
      ))}

      <div className="ed-gallery-actions">
        {count < MAX_PHOTOS && (
          <button
            type="button"
            className="ed-link-btn"
            onClick={() => onChange({ ...block, images: [...block.images, { src: "", alt: "" }] })}
          >
            <Icon name="plus" />
            Додати фото ({count}/{MAX_PHOTOS})
          </button>
        )}
        {free > 0 && (
          <label className="ed-link-btn">
            <Icon name="upload" />
            Завантажити кілька
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              hidden
              onChange={(e) => {
                const files = [...(e.target.files ?? [])].slice(0, free);
                if (files.length) start(files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <UploadList tasks={tasks} onDismiss={dismiss} />

      <TextInput label="Підпис" value={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} />
    </>
  );
};

// ---------- Розділювач ----------

const DIVIDER_LABEL: Record<DividerStyle, string> = {
  dots: "Три крапки",
  line: "Лінія",
  dove: "Лінія з голубкою",
  space: "Просто відступ",
};

const DividerSample = ({ style }: { style: DividerStyle }) => (
  <span className={`ed-divider-sample ed-divider-sample--${style}`} aria-hidden="true">
    {style === "dots" && (
      <>
        <i />
        <i />
        <i />
      </>
    )}
    {style === "dove" && <LogoMark />}
  </span>
);

export const DividerFields = ({ block, onChange }: { block: DividerBlock; onChange: (b: DividerBlock) => void }) => {
  const current = block.style ?? "dots";
  return (
    <Field label="Вигляд">
      <div className="ed-layout-pick" role="radiogroup" aria-label="Вигляд розділювача">
        {DIVIDER_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={current === s}
            className={`ed-layout-pick__btn ${current === s ? "is-active" : ""}`.trim()}
            onClick={() => onChange({ ...block, style: s })}
          >
            <DividerSample style={s} />
            <span>{DIVIDER_LABEL[s]}</span>
          </button>
        ))}
      </div>
    </Field>
  );
};
