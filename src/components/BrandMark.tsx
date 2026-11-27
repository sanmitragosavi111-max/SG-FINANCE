interface BrandMarkProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

/**
 * Bespoke SG FINANCE financial crest & wordmark.
 * Precision architectural double-frame emblem with refined serif SG monogram.
 */
export function BrandMark({ tone = 'dark', size = 'md' }: BrandMarkProps) {
  const wordmarkColor = tone === 'light' ? 'text-white' : 'text-[#0B1628]';
  const accentColor = tone === 'light' ? '#D4BC85' : '#B99752';
  const innerStroke = tone === 'light' ? 'rgba(212, 188, 133, 0.42)' : 'rgba(11, 22, 40, 0.22)';
  const monogramFill = tone === 'light' ? '#FFFFFF' : '#0B1628';
  const dim = size === 'sm' ? 30 : 34;

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 group">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          stroke={accentColor}
          strokeWidth="1.2"
        />
        <rect
          x="4"
          y="4"
          width="28"
          height="28"
          stroke={innerStroke}
          strokeWidth="0.75"
        />
        <path d="M1 1H6M30 1H35M1 35H6M30 35H35" stroke={accentColor} strokeWidth="1.6" />
        <text
          x="18"
          y="23.2"
          textAnchor="middle"
          fill={monogramFill}
          fontFamily="'DM Serif Display', Georgia, serif"
          fontSize="15"
          letterSpacing="0.6"
        >
          SG
        </text>
        <line x1="12" y1="27.2" x2="24" y2="27.2" stroke={accentColor} strokeWidth="1" />
      </svg>
      <span
        className={`font-display ${
          size === 'sm' ? 'text-[1.0625rem]' : 'text-[1.1875rem]'
        } tracking-[0.09em] ${wordmarkColor} whitespace-nowrap`}
      >
        SG FINANCE
      </span>
    </span>
  );
}
