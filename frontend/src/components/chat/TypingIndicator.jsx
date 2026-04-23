import React from "react";
import { Fish } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 msg-enter" data-testid="typing-indicator">
      <div className="w-8 h-8 rounded-full pond-wave grid place-items-center shadow-sm">
        <Fish size={14} className="text-white" />
      </div>
      <div className="bubble-bot shadow-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
