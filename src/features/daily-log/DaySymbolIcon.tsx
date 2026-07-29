import type { DaySymbol } from '../../domain/day-theme/personalization';

export function DaySymbolIcon({
  symbol,
  themeSymbol,
  size = 18,
}: {
  symbol: DaySymbol | null;
  themeSymbol?: string;
  size?: number;
}) {
  if (symbol === 'none') return null;
  if (symbol === null)
    return themeSymbol ? (
      <span>{themeSymbol}</span>
    ) : (
      <DaySymbolSvg symbol="sparkle" size={size} />
    );
  return <DaySymbolSvg symbol={symbol} size={size} />;
}

function DaySymbolSvg({
  symbol,
  size,
}: {
  symbol: Exclude<DaySymbol, 'none'>;
  size: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (symbol === 'focus')
    return (
      <svg {...common} data-day-symbol-icon="focus">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  if (symbol === 'growth')
    return (
      <svg {...common} data-day-symbol-icon="growth">
        <path d="M12 21v-9" />
        <path d="M12 15c-5 0-7-3-7-7 5 0 7 3 7 7Z" />
        <path d="M12 11c4 0 6-2.5 6-6-4 0-6 2.5-6 6Z" />
      </svg>
    );
  if (symbol === 'calm')
    return (
      <svg {...common} data-day-symbol-icon="calm">
        <path d="M3 8c3-2 6 2 9 0s6 2 9 0" />
        <path d="M3 13c3-2 6 2 9 0s6 2 9 0" />
        <path d="M3 18c3-2 6 2 9 0s6 2 9 0" />
      </svg>
    );
  if (symbol === 'celebrate')
    return (
      <svg {...common} data-day-symbol-icon="celebrate">
        <path d="m5 20 4-11 6 6-10 5Z" />
        <path d="M14 4v3M19 7l-2 2M10 3l1 3M20 13l-3-1" />
      </svg>
    );
  return (
    <svg {...common} data-day-symbol-icon="sparkle">
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
      <path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
    </svg>
  );
}
