import { useState } from 'react';
import { Shield } from 'lucide-react';

interface SiteImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackTitle?: string;
}

export function SiteImage({
  src,
  alt,
  className = '',
  eager = false,
  fallbackTitle = 'SG FINANCE',
}: SiteImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-[#0A1628] via-[#12233D] to-[#070E1A] flex flex-col items-center justify-center p-8 text-center ${className}`}
      >
        <Shield className="w-8 h-8 text-[#D4AF5A] mb-3" strokeWidth={1.5} aria-hidden="true" />
        <p className="font-display text-lg text-white">{fallbackTitle}</p>
        <p className="text-xs text-slate-300 mt-1">Pune, Maharashtra</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
