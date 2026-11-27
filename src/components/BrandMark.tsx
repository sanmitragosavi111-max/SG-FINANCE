export const SG_FINANCE_LOGO_SRC = '/assets/aistudio/SG_FINANCE_LOGO_53d9e8c1.png';

interface BrandMarkProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Official SG FINANCE brand logo & wordmark.
 * Displays the official logo asset with balanced framing on both light and deep-navy surfaces.
 */
export function BrandMark({ tone = 'dark', size = 'md' }: BrandMarkProps) {
  const wordmarkColor = tone === 'light' ? 'text-white' : 'text-[#0B1628]';
  const frameClass =
    tone === 'light'
      ? 'bg-white border border-[#D4BC85]/45 shadow-xs'
      : 'bg-white border border-[#E5DFD3]';

  const boxSizeClass =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
        ? 'w-14 h-14 sm:w-16 sm:h-16'
        : 'w-11 h-11 sm:w-[52px] sm:h-[52px]';

  const textSizeClass =
    size === 'sm'
      ? 'text-[1.0625rem]'
      : size === 'lg'
        ? 'text-[1.25rem] sm:text-[1.375rem]'
        : 'text-[1.125rem] sm:text-[1.2rem]';

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 group">
      <span
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-xs shrink-0 ${boxSizeClass} ${frameClass}`}
      >
        <img
          src={SG_FINANCE_LOGO_SRC}
          alt="SG FINANCE official logo"
          width={64}
          height={64}
          decoding="async"
          className="w-full h-full object-contain scale-[1.82] translate-y-[2%] select-none pointer-events-none"
        />
      </span>
      <span
        className={`font-display ${textSizeClass} tracking-[0.09em] ${wordmarkColor} whitespace-nowrap`}
      >
        SG FINANCE
      </span>
    </span>
  );
}
