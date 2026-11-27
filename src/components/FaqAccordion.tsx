import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { FaqItem } from '../config/defaults';

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-[#E5DFD3] border-t border-b border-[#E5DFD3]">
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="transition-colors">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              className="w-full py-6 flex items-start justify-between gap-6 text-left group cursor-pointer"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-[#B99752] tabular-nums shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl sm:text-[1.35rem] text-[#0B1628] group-hover:text-[#B99752] transition-colors leading-snug">
                  {item.question}
                </span>
              </span>
              <span
                className={`w-7 h-7 shrink-0 inline-flex items-center justify-center border transition-colors mt-0.5 ${
                  isOpen
                    ? 'border-[#B99752] text-[#B99752]'
                    : 'border-[#E5DFD3] text-[#747C86] group-hover:border-[#0B1628] group-hover:text-[#0B1628]'
                }`}
                aria-hidden="true"
              >
                {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${item.id}`}
                className="pb-7 pl-8 sm:pl-9 pr-6 text-[0.9375rem] text-[#4B5563] leading-[1.75] max-w-3xl"
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
