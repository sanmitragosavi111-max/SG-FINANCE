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
      className="hidden md:inline-flex fixed bottom-5 right-5 z-40 items-center gap-2.5 h-12 px-4 bg-[#0A1628] text-white border border-[#B89347]/80 shadow-lg hover:bg-[#12233D] transition-colors duration-150 whitespace-nowrap"
    >
      <MessageCircle className="w-5 h-5 text-[#D4AF5A] shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">Chat With Us</span>
    </a>
  );
}
