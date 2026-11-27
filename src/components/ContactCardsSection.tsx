import { Phone, MessageCircle, Mail } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { formatIndianPhoneDisplay, getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';

interface ContactCardsSectionProps {
  compact?: boolean;
}

export function ContactCardsSection({ compact = false }: ContactCardsSectionProps) {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const formattedPhone = formatIndianPhoneDisplay(settings.phoneDisplay);
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
    return formattedPhone || OFFICIAL_CONTACT.whatsappDisplay;
  })();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${compact ? '' : 'mb-16'}`}>
      {/* Card 1: CALL US */}
      <div className="bg-white border border-[#E5DFD3] hover:border-[#B99752]/70 transition-colors duration-200 p-7 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752]">
            CALL US
          </p>
          <p className="font-display text-2xl sm:text-[1.75rem] text-[#0B1628] tabular-nums leading-snug">
            {formattedPhone}
          </p>
          <p className="text-sm text-[#747C86] leading-relaxed">
            Speak directly with our Pune consultation desk during business working hours.
          </p>
        </div>
        <a
          href={telHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors duration-150 whitespace-nowrap"
        >
          <Phone className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
          Call Now
        </a>
      </div>

      {/* Card 2: WHATSAPP US */}
      <div className="bg-white border border-[#E5DFD3] hover:border-[#B99752]/70 transition-colors duration-200 p-7 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752]">
            WHATSAPP US
          </p>
          <p className="font-display text-2xl sm:text-[1.75rem] text-[#0B1628] tabular-nums leading-snug">
            {whatsappDisplay}
          </p>
          <p className="text-sm text-[#747C86] leading-relaxed">
            Start a direct WhatsApp conversation with our team for clear guidance on next steps.
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors duration-150 whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          Chat on WhatsApp
        </a>
      </div>

      {/* Card 3: EMAIL US */}
      <div className="bg-white border border-[#E5DFD3] hover:border-[#B99752]/70 transition-colors duration-200 p-7 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752]">
            EMAIL US
          </p>
          <p className="font-display text-xl sm:text-[1.55rem] text-[#0B1628] break-all leading-snug">
            {settings.email}
          </p>
          <p className="text-sm text-[#747C86] leading-relaxed">
            Write to our enquiries desk for formal questions, documentation queries, or appointments.
          </p>
        </div>
        <a
          href={mailtoHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1628] border border-[#0B1628]/25 bg-white hover:border-[#0B1628] transition-colors duration-150 whitespace-nowrap"
        >
          <Mail className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
          Send Email
        </a>
      </div>
    </div>
  );
}
