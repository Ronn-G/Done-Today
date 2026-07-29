import { CircleDot, PartyPopper, Sparkles, Sprout, Waves } from 'lucide-react';
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
    return themeSymbol ? <span>{themeSymbol}</span> : <Sparkles size={size} />;
  const props = { size, strokeWidth: 2.2 };
  switch (symbol) {
    case 'focus':
      return <CircleDot {...props} />;
    case 'growth':
      return <Sprout {...props} />;
    case 'calm':
      return <Waves {...props} />;
    case 'celebrate':
      return <PartyPopper {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}
