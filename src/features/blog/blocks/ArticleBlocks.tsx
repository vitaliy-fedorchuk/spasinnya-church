import type { ComponentType } from "react";
import type { ArticleBlock } from "../types";
import { BLOCKS } from "./registry";
import "./blocks.scss";

/** Блоки, ширші за колонку тексту */
const isWide = (block: ArticleBlock) =>
  block.type === "gallery" ||
  block.type === "video" ||
  block.type === "verse" ||
  block.type === "word" ||
  (block.type === "image" && !!block.wide);

/** Модифікатори обгортки: ширина і відступи залежать від виду блоку */
const itemClass = (block: ArticleBlock) =>
  [
    "ab-item",
    `ab-item--${block.type}`,
    block.type === "heading" && `ab-item--heading-${block.level}`,
    isWide(block) && "ab-item--wide",
  ]
    .filter(Boolean)
    .join(" ");

/** Малює блоки статті по черзі; невідомі типи (напр. зі старої адмінки) пропускає */
const ArticleBlocks = ({ blocks }: { blocks: ArticleBlock[] }) => (
  <div className="article-blocks">
    {blocks.map((block) => {
      const entry = BLOCKS[block.type];
      if (!entry) return null;
      const Component = entry.component as ComponentType<{ block: ArticleBlock }>;
      return (
        <div key={block.id} className={itemClass(block)}>
          <Component block={block} />
        </div>
      );
    })}
  </div>
);

export default ArticleBlocks;
