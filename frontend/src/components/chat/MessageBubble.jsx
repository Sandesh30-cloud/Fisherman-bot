import React from "react";
import { Fish } from "lucide-react";

export default function MessageBubble({ role, children, time }) {
  const isUser = role === "user";
  return (
    <div
      className={`flex w-full msg-enter ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`bubble-${role}`}
    >
      <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[82%]">
        {!isUser && (
          <div className="w-8 h-8 rounded-full pond-wave grid place-items-center shrink-0 shadow-sm">
            <Fish size={14} className="text-white" />
          </div>
        )}
        <div
          className={`px-4 py-3 text-[15px] leading-relaxed ${
            isUser ? "bubble-user" : "bubble-bot shadow-sm"
          }`}
        >
          {children}
          {time && (
            <div
              className={`mt-1.5 text-[10px] tracking-wide ${
                isUser ? "text-white/70" : "text-[color:var(--muted)]"
              }`}
            >
              {time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
