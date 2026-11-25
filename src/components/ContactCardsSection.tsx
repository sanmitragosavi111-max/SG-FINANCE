import { Phone, MessageCircle, Mail } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';

interface ContactCardsSectionProps {
  compact?: boolean;
}

export function ContactCardsSection({ compact = false }: ContactCardsSectionProps) {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );
  const mailtoHref = getMailtoHref(settings.email);

  const whatsappDisplay = (() => {
    const digits = (settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2)}`;
    }
    if (digits.length === 10) {
      return `+91 ${digits}`;
    }
    return settings.phoneDisplay || OFFICIAL_CONTACT.whatsappDisplay;
  })();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${compact ? '' : 'mb-14'}`}>
      {/* Card 1: CALL US */}
      <div className="bg-white border border-slate-200 p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-[#0A1628] text-[#D4AF5A] inline-flex items-center justify-center">
            <Phone className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
            CALL US
          </p>
          <p className="font-display text-2xl font-semibold text-[#0A1628] tabular-nums">
            {settings.phoneDisplay}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Speak directly with our Pune consultation desk during business working hours.
          </p>
        </div>
        <a
          href={telHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
        >
          <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
          Call Now
        </a>
      </div>

      {/* Card 2: WHATSAPP US */}
      <div className="bg-white border border-slate-200 p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-[#0A1628] text-[#D4AF5A] inline-flex items-center justify-center">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
            WHATSAPP US
          </p>
          <p className="font-display text-2xl font-semibold text-[#0A1628] tabular-nums">
            {whatsappDisplay}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Start a direct WhatsApp conversation with our team for quick guidance on next steps.
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          Chat on WhatsApp
        </a>
      </div>

      {/* Card 3: EMAIL US */}
      <div className="bg-white border border-slate-200 p-7 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-[#0A1628] text-[#D4AF5A] inline-flex items-center justify-center">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
            EMAIL US
          </p>
          <p className="font-display text-xl sm:text-2xl font-semibold text-[#0A1628] break-all">
            {settings.email}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Write to our enquiries desk for formal questions, documentation queries, or appointments.
          </p>
        </div>
        <a
          href={mailtoHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#0A1628] border border-slate-300 bg-white hover:border-[#0A1628] transition-colors whitespace-nowrap"
        >
          <Mail className="w-4 h-4 text-[#8C6A24]" aria-hidden="true" />
          Send Email
        </a>
      </div>
    </div>
  );
}
