import React, { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";
import { s } from "../../lib/i18n";

export default function ChatInput({ onSend, disabled }) {
  const { lang } = useLang();
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="relative"
      data-testid="chat-input-form"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={s("input_ph", lang)}
        disabled={disabled}
        className="w-full bg-white border border-[color:var(--hairline)] rounded-2xl py-4 pl-5 pr-14 text-[15px] outline-none focus:border-[color:var(--pond)] focus:ring-2 focus:ring-[color:var(--pond)]/15 transition shadow-sm"
        data-testid="chat-input-field"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl btn-pond grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
        data-testid="send-message-button"
        aria-label="Send"
      >
        <SendHorizonal size={17} />
      </button>
    </form>
  );
}
