import type { ReactNode } from "react";

// **жирний** | *курсив* | [текст](посилання)
const TOKEN = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;

/**
 * Простий інлайн-формат для текстів зі статті (без HTML — безпечно для даних з адмінки).
 * Підтримує **жирний**, *курсив* і [посилання](https://...).
 */
const InlineText = ({ text }: { text: string }) => {
  const parts: ReactNode[] = [];
  let last = 0;

  for (const m of text.matchAll(TOKEN)) {
    const i = m.index;
    if (i > last) parts.push(text.slice(last, i));

    const [, bold, italic, linkText, href] = m;
    if (bold) parts.push(<strong key={i}>{bold}</strong>);
    else if (italic) parts.push(<em key={i}>{italic}</em>);
    else {
      const external = /^https?:/.test(href);
      parts.push(
        <a key={i} href={href} {...(external && { target: "_blank", rel: "noreferrer" })}>
          {linkText}
        </a>,
      );
    }
    last = i + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
};

export default InlineText;
