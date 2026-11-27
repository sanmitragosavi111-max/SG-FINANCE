import { Link } from 'react-router-dom';
import { Phone, MessageCircle, FileText } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';

export function MobileContactBar() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <nav
      aria-label="Mobile quick contact"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-[52px] bg-[#0B1628]/98 backdrop-blur-md border-t border-[#B99752]/35 grid grid-cols-3 divide-x divide-white/10"
    >
      <a
        href={telHref}
        className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-white hover:bg-white/5 transition-colors whitespace-nowrap"
      >
        <Phone className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
        CALL
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-white hover:bg-white/5 transition-colors whitespace-nowrap"
      >
        <MessageCircle className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
        WHATSAPP
      </a>
      <Link
        to="/enquire"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
      >
        <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
        ENQUIRE
      </Link>
    </nav>
  );
}
