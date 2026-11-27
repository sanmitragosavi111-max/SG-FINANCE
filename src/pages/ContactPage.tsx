import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { SeoHead } from '../components/SeoHead';
import { EnquiryForm } from '../components/EnquiryForm';
import { ContactCardsSection } from '../components/ContactCardsSection';
import { Reveal } from '../components/Reveal';
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

      {/* Refined Warm Ivory Header */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                Contact SG FINANCE · Pune, Maharashtra
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628] leading-[1.1]">
              Reach our Pune team directly.
            </h1>
            <p className="text-base text-[#4B5563] leading-[1.75]">
              Call us, chat on WhatsApp, email our enquiries desk, or submit your requirement below during business working hours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Premium 3-Card Direct Contact Section */}
          <Reveal>
            <ContactCardsSection />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Office & Communication Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-7 sm:p-8 space-y-6">
                <h2 className="font-display text-2xl text-[#0B1628]">
                  Office &amp; Communication Details
                </h2>

                <dl className="space-y-5 text-sm">
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-4 h-4 text-[#B99752] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-[#747C86]">Phone Number</dt>
                      <dd className="mt-0.5 text-[#0B1628] font-semibold tabular-nums">
                        <a
                          href={telHref}
                          className="hover:text-[#B99752] transition-colors"
                        >
                          {settings.phoneDisplay}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MessageCircle className="w-4 h-4 text-[#B99752] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-[#747C86]">WhatsApp Desk</dt>
                      <dd className="mt-0.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0B1628] font-medium underline underline-offset-4 decoration-[#B99752]/50 hover:text-[#B99752] transition-colors"
                        >
                          Chat on WhatsApp ({settings.phoneDisplay})
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Mail className="w-4 h-4 text-[#B99752] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-[#747C86]">Email Address</dt>
                      <dd className="mt-0.5 text-[#0B1628] font-semibold break-all">
                        <a
                          href={mailtoHref}
                          className="hover:text-[#B99752] transition-colors"
                        >
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-4 h-4 text-[#B99752] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-[#747C86]">Business Address</dt>
                      <dd className="mt-0.5 text-[#202A36] leading-relaxed">
                        {settings.addressLine}
                        <br />
                        {settings.cityRegion}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock className="w-4 h-4 text-[#B99752] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-[#747C86]">Business Working Hours</dt>
                      <dd className="mt-0.5 text-[#202A36]">{settings.workingHours}</dd>
                    </div>
                  </div>
                </dl>

                {/* Quick Direct Action Buttons */}
                <div className="pt-5 border-t border-[#E5DFD3] flex flex-wrap gap-2.5">
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                    Call Now
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#0B1628] transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                    Email Us
                  </a>
                </div>

                {/* Social Channels */}
                <div className="pt-5 border-t border-[#E5DFD3]">
                  <p className="text-xs font-medium text-[#747C86] mb-3">
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
                          className="inline-flex items-center gap-1 font-medium text-[#0B1628] hover:text-[#B99752] transition-colors"
                        >
                          {social.label}
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span key={social.label} className="text-[#747C86]">
                          {social.label} (Link pending)
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Google Maps Location Frame */}
              <div className="bg-white border border-[#E5DFD3] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5DFD3] flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#0B1628]">
                    Office Location Map
                  </h2>
                  <span className="text-xs text-[#747C86]">{settings.cityRegion}</span>
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
                  <div className="h-56 bg-[#0B1628] text-white p-6 flex flex-col items-center justify-center text-center space-y-2.5">
                    <MapPin className="w-6 h-6 text-[#D4BC85]" aria-hidden="true" />
                    <p className="font-display text-lg text-white">
                      Pune, Maharashtra Office Map
                    </p>
                    <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                      Add your verified Google Maps Embed URL in the Admin Dashboard under Website Settings to display your office pin here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Contact Enquiry Form */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-display text-2xl sm:text-3xl text-[#0B1628]">
                  Send a Confidential Enquiry
                </h2>
                <p className="text-sm text-[#4B5563]">
                  Fill in your contact details and requirement below. All submissions are handled strictly privately.
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
