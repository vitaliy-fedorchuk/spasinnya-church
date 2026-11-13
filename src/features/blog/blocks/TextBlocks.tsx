import type { DividerBlock, HeadingBlock, LeadBlock, ListBlock, TextBlock } from "../types";
import LogoMark from "@/components/ui/LogoMark";
import InlineText from "./InlineText";

export const Lead = ({ block }: { block: LeadBlock }) => (
  <p className="ab-lead">
    <InlineText text={block.text} />
  </p>
);

export const Text = ({ block }: { block: TextBlock }) => (
  <div className="ab-text">
    {block.paragraphs.map((p, i) => (
      <p key={i}>
        <InlineText text={p} />
      </p>
    ))}
  </div>
);

export const Heading = ({ block }: { block: HeadingBlock }) => {
  const Tag = block.level === 2 ? "h2" : "h3";
  return (
    <Tag className={`ab-heading ab-heading--h${block.level}`}>
      <InlineText text={block.text} />
    </Tag>
  );
};

export const List = ({ block }: { block: ListBlock }) => {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag className={`ab-list ${block.ordered ? "ab-list--ordered" : ""}`.trim()}>
      {block.items.map((item, i) => (
        <li key={i}>
          <InlineText text={item} />
        </li>
      ))}
    </Tag>
  );
};

export const Divider = ({ block }: { block: DividerBlock }) => {
  const style = block.style ?? "dots";
  return (
    <div className={`ab-divider ab-divider--${style}`} role="separator">
      {style === "dots" && (
        <>
          <span className="ab-divider__dot" />
          <span className="ab-divider__dot" />
          <span className="ab-divider__dot" />
        </>
      )}
      {style === "dove" && <LogoMark />}
    </div>
  );
};
