import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { SeoHead } from '../components/SeoHead';
import { EnquiryForm } from '../components/EnquiryForm';
import { ContactCardsSection } from '../components/ContactCardsSection';
import { buildWhatsAppUrl, sanitizeExternalUrl } from '../utils/validation';

export function ContactPage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const mailtoHref = getMailtoHref(settings.email);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  const safeMapsUrl = (() => {
    const valid = sanitizeExternalUrl(settings.mapsEmbedUrl);
    if (!valid) return null;
    try {
      const parsed = new URL(valid);
      if (parsed.hostname.includes('google.com') && parsed.pathname.includes('/maps/embed')) {
        return valid;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const socialLinks = [
    { label: 'Instagram', href: sanitizeExternalUrl(settings.instagramUrl) },
    { label: 'Facebook', href: sanitizeExternalUrl(settings.facebookUrl) },
    { label: 'WhatsApp', href: whatsappUrl },
    { label: 'LinkedIn', href: sanitizeExternalUrl(settings.linkedinUrl) },
  ];

  return (
    <>
      <SeoHead
        title="Contact Us | SG FINANCE Pune, Maharashtra"
        description="Contact SG FINANCE in Pune, Maharashtra via phone (+91 7038391002), WhatsApp, email (in.sg.infra@gmail.com), or online enquiry form."
        path="/contact"
      />

      <section className="bg-[#0A1628] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              Contact SG FINANCE
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Reach our Pune team directly.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Call us, chat on WhatsApp, email our team, or submit your enquiry below during business working hours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Premium 3-Card Direct Contact Section */}
          <ContactCardsSection />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Contact Information */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white border border-slate-200 p-7 space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#0A1628]">
                  Office &amp; Communication Details
                </h2>

                <dl className="space-y-5 text-sm">
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Phone Number</dt>
                      <dd className="mt-0.5 text-slate-900 font-medium tabular-nums">
                        <a
                          href={telHref}
                          className="hover:text-[#8C6A24] transition-colors"
                        >
                          {settings.phoneDisplay}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MessageCircle className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">WhatsApp Desk</dt>
                      <dd className="mt-0.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A1628] font-medium underline underline-offset-2 hover:text-[#8C6A24] transition-colors"
                        >
                          Chat on WhatsApp ({settings.phoneDisplay})
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Mail className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Email Address</dt>
                      <dd className="mt-0.5 text-slate-900 font-medium break-all">
                        <a
                          href={mailtoHref}
                          className="hover:text-[#8C6A24] transition-colors"
                        >
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Business Address</dt>
                      <dd className="mt-0.5 text-slate-900 leading-relaxed">
                        {settings.addressLine}
                        <br />
                        {settings.cityRegion}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Business Working Hours</dt>
                      <dd className="mt-0.5 text-slate-900">{settings.workingHours}</dd>
                    </div>
                  </div>
                </dl>

                {/* Quick Direct Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2.5">
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                    Call Now
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0A1628] border border-slate-300 hover:border-[#0A1628] transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 text-[#8C6A24]" aria-hidden="true" />
                    Email Us
                  </a>
                </div>

                {/* Social Channels */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Official Social Media Channels
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {socialLinks.map((social) =>
                      social.href ? (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#0A1628] hover:text-[#8C6A24] transition-colors"
                        >
                          {social.label}
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span key={social.label} className="text-slate-400">
                          {social.label} (Link pending)
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Google Maps Location Placeholder / Embed */}
              <div className="bg-white border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#0A1628]">
                    Office Location Map
                  </h2>
                  <span className="text-xs text-slate-500">{settings.cityRegion}</span>
                </div>
                {safeMapsUrl ? (
                  <iframe
                    title="SG FINANCE Office Location Map"
                    src={safeMapsUrl}
                    className="w-full h-64 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="h-60 bg-[#0A1628] text-white p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <MapPin className="w-7 h-7 text-[#D4AF5A]" aria-hidden="true" />
                    <p className="font-display text-lg font-medium">
                      Google Maps Location Placeholder
                    </p>
                    <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                      Pune, Maharashtra, India. Add your verified Google Maps Embed URL in the Admin Dashboard under Website Settings to display your exact office pin here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Contact Enquiry Form */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628]">
                  Send an Enquiry
                </h2>
                <p className="text-sm text-slate-600">
                  Fill in your contact details and requirement below. All submissions are kept confidential.
                </p>
              </div>
              <EnquiryForm source="website_contact" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
