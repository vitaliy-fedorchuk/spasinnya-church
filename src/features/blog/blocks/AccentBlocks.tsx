import BlackButton from "../../../components/buttons/BlackButton";
import LogoMark from "@/components/ui/LogoMark";
import type { ButtonBlock, CalloutBlock, QuoteBlock, VerseBlock, WordBlock } from "../types";
import InlineText from "./InlineText";

const QUOTE_MARK =
  "M0 30V18.6C0 13.4 1.2 9.2 3.6 6 6.1 2.8 9.6.8 14.2 0l1.6 3.9c-2.7.8-4.7 2.2-6 4.2-1.3 2-1.9 4.2-1.8 6.6h7.6V30H0Zm24.2 0V18.6c0-5.2 1.2-9.4 3.6-12.6C30.3 2.8 33.8.8 38.4 0L40 3.9c-2.7.8-4.7 2.2-6 4.2-1.3 2-1.9 4.2-1.8 6.6h7.6V30H24.2Z";

export const Quote = ({ block }: { block: QuoteBlock }) => (
  <figure className="ab-quote">
    <svg className="ab-quote__mark" viewBox="0 0 40 30" aria-hidden="true">
      <path d={QUOTE_MARK} />
    </svg>
    <blockquote className="ab-quote__text">
      <p>
        <InlineText text={block.text} />
      </p>
    </blockquote>
    {block.author && (
      <figcaption className="ab-quote__author">
        <span className="ab-quote__name">{block.author}</span>
        {block.role && <span className="ab-quote__role">{block.role}</span>}
      </figcaption>
    )}
  </figure>
);

export const Verse = ({ block }: { block: VerseBlock }) => (
  <figure className="ab-verse" data-surface="dark">
    <blockquote className="ab-verse__text">
      <p>«{block.text}»</p>
    </blockquote>
    <figcaption className="ab-verse__ref">{block.reference}</figcaption>
  </figure>
);

export const Word = ({ block }: { block: WordBlock }) => {
  const mark = block.mark ?? "dove";
  return (
    <figure className={`ab-word ab-word--${mark}`}>
      {mark === "dove" && <LogoMark className="ab-word__dove" />}
      {mark === "emblem" && <LogoMark className="ab-word__emblem" />}
      {mark === "quote" && (
        <svg className="ab-word__quote" viewBox="0 0 40 30" aria-hidden="true">
          <path d={QUOTE_MARK} />
        </svg>
      )}
      <blockquote className="ab-word__text">
        <p>
          <InlineText text={block.text} />
        </p>
      </blockquote>
      {block.caption && <figcaption className="ab-word__caption">{block.caption}</figcaption>}
    </figure>
  );
};

export const Callout = ({ block }: { block: CalloutBlock }) => (
  <aside className="ab-callout">
    {block.title && <p className="ab-callout__title">{block.title}</p>}
    <p className="ab-callout__text">
      <InlineText text={block.text} />
    </p>
  </aside>
);

export const Button = ({ block }: { block: ButtonBlock }) => (
  <div className="ab-button">
    <BlackButton text={block.text} href={block.href} external={block.external} />
  </div>
);
