"use client";

import { useState } from "react";

/** Кнопка «Скопіювати адресу» — для тих, у кого не налаштована поштова програма */
const CopyEmail = ({ email }: { email: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер обміну недоступний — нічого не робимо */
    }
  };

  return (
    <button type="button" className="contacts-copy" onClick={copy} aria-live="polite">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {copied ? (
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
          </>
        )}
      </svg>
      {copied ? "Скопійовано" : "Скопіювати адресу"}
    </button>
  );
};

export default CopyEmail;
