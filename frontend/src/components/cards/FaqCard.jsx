import React from "react";
import { HelpCircle, Book } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FaqCard({ data }) {
  if (!data) return null;
  const { intro, items, is_list } = data;
  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-5 shadow-sm"
      data-testid="faq-card"
    >
      <div className="flex items-center gap-2 mb-2">
        {is_list ? (
          <Book size={16} className="text-[color:var(--pond)]" />
        ) : (
          <HelpCircle size={16} className="text-[color:var(--pond)]" />
        )}
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          {is_list ? "Popular questions" : "FAQ match"}
        </h4>
      </div>
      <p className="text-sm text-[color:var(--ink-soft)] mb-2">{intro}</p>
      <Accordion type="single" collapsible className="w-full">
        {items?.map((it, i) => (
          <AccordionItem
            key={it.id}
            value={it.id}
            className="border-b border-[color:var(--hairline)] last:border-0"
            data-testid={`faq-item-${it.id}`}
          >
            <AccordionTrigger className="text-left text-[14px] font-semibold text-[color:var(--ink)] hover:no-underline">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-[13.5px] text-[color:var(--ink-soft)] leading-relaxed pb-4">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
