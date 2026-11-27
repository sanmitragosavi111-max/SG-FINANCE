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
      className="hidden md:inline-flex fixed bottom-6 right-6 z-40 items-center gap-2.5 h-12 px-5 bg-[#0B1628] text-white border border-[#B99752]/70 shadow-[0_10px_30px_rgba(11,22,40,0.2)] hover:bg-[#101F35] hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap"
    >
      <MessageCircle className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium tracking-wide">Chat With Us</span>
    </a>
  );
}
