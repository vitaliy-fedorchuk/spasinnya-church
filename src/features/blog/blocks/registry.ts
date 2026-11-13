import type { ComponentType } from "react";
import type { ArticleBlock, BlockType } from "../types";
import { Divider, Heading, Lead, List, Text } from "./TextBlocks";
import { Button, Callout, Quote, Verse } from "./AccentBlocks";
import { Gallery, Image, Video } from "./MediaBlocks";

type BlockComponent<T extends BlockType> = ComponentType<{
  block: Extract<ArticleBlock, { type: T }>;
}>;

/**
 * Тип блоку → компонент. TypeScript не дасть забути зареєструвати новий тип.
 * Підписи — для майбутньої адмінки (меню «Додати блок»).
 */
export const BLOCKS: { [T in BlockType]: { label: string; component: BlockComponent<T> } } = {
  lead: { label: "Вступ", component: Lead },
  text: { label: "Текст", component: Text },
  heading: { label: "Підзаголовок", component: Heading },
  quote: { label: "Цитата", component: Quote },
  verse: { label: "Біблійний вірш", component: Verse },
  image: { label: "Фото", component: Image },
  gallery: { label: "Галерея", component: Gallery },
  list: { label: "Список", component: List },
  video: { label: "Відео", component: Video },
  callout: { label: "Примітка", component: Callout },
  divider: { label: "Розділювач", component: Divider },
  button: { label: "Кнопка", component: Button },
};
