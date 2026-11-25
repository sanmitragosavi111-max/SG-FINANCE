import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../config/defaults';

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              className="w-full py-5 flex items-center justify-between gap-6 text-left group cursor-pointer"
            >
              <span className="font-display text-lg font-medium text-[#0A1628] group-hover:text-[#8C6A24] transition-colors">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-150 ${
                  isOpen ? 'rotate-180 text-[#8C6A24]' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${item.id}`}
                className="pb-6 pr-8 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
