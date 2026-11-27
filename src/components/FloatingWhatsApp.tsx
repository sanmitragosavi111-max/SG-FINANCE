import { MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';

export function FloatingWhatsApp() {
  const { settings } = useSite();
  const href = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat With Us on WhatsApp"
      className="hidden md:inline-flex fixed bottom-[84px] right-6 z-40 items-center gap-2 h-10 px-4 bg-white text-[#0B1628] border border-[#E5DFD3] shadow-[0_8px_24px_rgba(11,22,40,0.12)] hover:border-[#B99752] hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap"
    >
      <MessageCircle className="w-4 h-4 text-[#B99752] shrink-0" aria-hidden="true" />
      <span className="text-xs font-semibold tracking-wide">Chat With Us</span>
    </a>
  );
}
