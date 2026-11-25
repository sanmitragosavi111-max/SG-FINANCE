interface BrandMarkProps {
  tone?: 'light' | 'dark';
}

export function BrandMark({ tone = 'light' }: BrandMarkProps) {
  const textColor = tone === 'light' ? 'text-white' : 'text-[#0A1628]';
  const strokeColor = tone === 'light' ? '#D4AF5A' : '#9A7832';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1.25" y="1.25" width="25.5" height="25.5" stroke={strokeColor} strokeWidth="1.4" />
        <text
          x="14"
          y="18.2"
          textAnchor="middle"
          fill={strokeColor}
          fontFamily="Playfair Display, Georgia, serif"
          fontSize="12.5"
          fontWeight="600"
          letterSpacing="0.5"
        >
          SG
        </text>
      </svg>
      <span
        className={`font-display text-lg font-semibold tracking-[0.06em] ${textColor} whitespace-nowrap`}
      >
        SG FINANCE
      </span>
    </span>
  );
}
