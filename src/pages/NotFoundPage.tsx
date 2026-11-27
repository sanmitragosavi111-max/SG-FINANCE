import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Page Not Found | SG FINANCE"
        description="The requested page could not be found on SG FINANCE."
        noIndex
      />

      <section className="py-24 sm:py-32 bg-[#F7F5F0]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <p className="font-mono text-xs font-medium tracking-[0.12em] text-[#B99752] tabular-nums">
            ERROR 404
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628]">
            Page not found.
          </h1>
          <p className="text-base text-[#4B5563] leading-[1.75]">
            The page you are looking for may have moved or does not exist. You can return to the SG FINANCE homepage or submit a direct enquiry below.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
              Return Home
            </Link>
            <Link
              to="/enquire"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#0B1628] transition-colors whitespace-nowrap"
            >
              Enquire Now
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
