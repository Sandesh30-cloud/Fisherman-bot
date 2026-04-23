import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import MessageBubble from "../components/chat/MessageBubble";
import TypingIndicator from "../components/chat/TypingIndicator";
import QuickActions from "../components/chat/QuickActions";
import ChatInput from "../components/chat/ChatInput";
import WeatherCard, { WeatherPrompt } from "../components/cards/WeatherCard";
import MarketCard from "../components/cards/MarketCard";
import FeedResultCard, { FeedForm } from "../components/cards/FeedCard";
import DiagnosisCard from "../components/cards/DiagnosisCard";
import DiagnosisPrompt from "../components/cards/DiagnosisPrompt";
import FaqCard from "../components/cards/FaqCard";
import { sendChat } from "../lib/api";
import { useLang } from "../lib/LanguageContext";
import { s } from "../lib/i18n";
import { Sparkles } from "lucide-react";

function formatTime(ts) {
  try {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function genSession() {
  try {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  } catch {
    return "s_static";
  }
}

export default function Chat() {
  const { lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState(null);
  const sessionId = useMemo(genSession, []);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const pushBot = (reply, card) =>
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: reply, card, time: formatTime() },
    ]);
  const pushUser = (text) =>
    setMessages((prev) => [
      ...prev,
      { role: "user", text, time: formatTime() },
    ]);

  const callChat = async (payload) => {
    setLoading(true);
    try {
      const data = await sendChat({ ...payload, language: lang, session_id: sessionId });
      setActiveIntent(data.intent);
      pushBot(data.reply, data.card);
    } catch (e) {
      pushBot("Sorry, something went wrong. Please try again.", {
        type: "error",
        detail: { message: e?.message || "network error" },
      });
    } finally {
      setLoading(false);
    }
  };

  const onSend = (text) => {
    pushUser(text);
    callChat({ message: text });
  };

  const onQuick = (intent) => {
    setActiveIntent(intent);
    const labels = {
      weather: s("quick_weather", lang),
      feed: s("quick_feed", lang),
      market: s("quick_market", lang),
      diagnosis: s("quick_diagnosis", lang),
      faq: s("quick_faq", lang),
    };
    pushUser(labels[intent]);
    callChat({ message: labels[intent], intent_override: intent });
  };

  const renderCard = (card, idx) => {
    if (!card) return null;
    switch (card.type) {
      case "weather":
        return <WeatherCard data={card} />;
      case "prompt_location":
        return (
          <WeatherPrompt
            loading={loading}
            onSubmit={(city) => {
              pushUser(city);
              callChat({ message: city, intent_override: "weather", location: city });
            }}
          />
        );
      case "market":
        return <MarketCard data={card} />;
      case "feed_form":
        return (
          <FeedForm
            loading={loading}
            onSubmit={(feed_params) => {
              pushUser(
                `Feed: ${feed_params.num_fish} × ${feed_params.fish_weight_g}g ${feed_params.species}`
              );
              callChat({ message: "feed", intent_override: "feed", feed_params });
            }}
          />
        );
      case "feed_result":
        return <FeedResultCard data={card} />;
      case "diagnosis":
        return (
          <>
            {(!card.matches || card.matches.length === 0) && (
              <DiagnosisPrompt
                loading={loading}
                onSubmit={(t) => {
                  pushUser(t);
                  callChat({ message: t, intent_override: "diagnosis" });
                }}
              />
            )}
            {card.matches?.length > 0 && <DiagnosisCard data={card} />}
          </>
        );
      case "faq":
        return <FaqCard data={card} />;
      case "error":
        return (
          <div className="alert-warn rounded-xl px-4 py-3 text-sm" data-testid="error-card">
            {card.detail?.message || "Request failed"}
          </div>
        );
      default:
        return null;
    }
  };

  // When user picks diagnosis quick action and there's no symptom text, prompt UI
  useEffect(() => {
    if (activeIntent !== "diagnosis") return;
    const last = messages[messages.length - 1];
    if (last?.role === "bot" && last?.card?.type === "diagnosis" && (!last.card.matches || last.card.matches.length === 0)) {
      // nothing to do; DiagnosisPrompt will render via renderCard
    }
  }, [messages, activeIntent]);

  const empty = messages.length === 0;

  return (
    <div className="min-h-screen bg-paper flex flex-col" data-testid="chat-page">
      <Header />
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 sm:px-6 pb-4 pt-4">
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto space-y-4 py-4 scroll-smooth"
          data-testid="chat-window"
        >
          {empty && (
            <div
              className="bg-white rounded-2xl border border-[color:var(--hairline)] p-6 sm:p-8 text-center msg-enter bg-scales"
              data-testid="chat-empty-state"
            >
              <div className="w-12 h-12 rounded-2xl pond-wave grid place-items-center mx-auto shadow-sm">
                <Sparkles size={18} className="text-white" />
              </div>
              <h2 className="mt-4 font-display font-black text-2xl text-[color:var(--ink)]">
                {s("chat_title", lang)}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--ink-soft)] max-w-md mx-auto">
                {s("empty_home", lang)}
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} time={m.time}>
              {m.text}
              {m.card && (
                <div className="mt-3 -mx-1">{renderCard(m.card, i)}</div>
              )}
            </MessageBubble>
          ))}

          {loading && <TypingIndicator />}
        </div>

        <div className="sticky bottom-0 pt-2 pb-3 glass -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-[color:var(--hairline)]">
          <div className="mb-2">
            <QuickActions onPick={onQuick} activeIntent={activeIntent} />
          </div>
          <ChatInput onSend={onSend} disabled={loading} />
          <div className="mt-2 flex items-center justify-between text-[10px] text-[color:var(--muted)] font-mono">
            <span>Session · {sessionId.slice(0, 12)}</span>
            <span>Powered by Matsyavan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
