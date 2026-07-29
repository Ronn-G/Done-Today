/* eslint-disable react-hooks/set-state-in-effect -- month changes intentionally start an isolated async load */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CalendarDaySummary } from '../../domain/journal/models';
import {
  compatibilityLocale,
  normalizeLocale,
} from '../../domain/localization/locale';
import { dayThemeRegistry } from '../../domain/day-theme/registry';
import {
  daySymbolOptions,
  resolveStoredDaySymbol,
} from '../../domain/day-theme/personalization';
import { DaySymbolIcon } from '../daily-log/DaySymbolIcon';
import { formatDate } from '../../i18n/formatters';
import {
  addLocalDays,
  formatLongLocalDate,
  localDateKey,
  parseLocalDate,
} from '../../shared/date';

type CalendarMarkerStyle = CSSProperties & {
  '--calendar-theme-color'?: string;
};

export type HistoryMonthCalendarProps = {
  loadMonth: (
    startDate: string,
    endDateExclusive: string,
  ) => Promise<CalendarDaySummary[]>;
  onOpenDay: (date: string) => void;
  initialMonth?: string;
  todayDate?: string;
};

function requiredDate(value: string): Date {
  const date = parseLocalDate(value);
  if (!date) throw new Error('Invalid local calendar date');
  return date;
}

function firstOfMonth(value: string): string {
  const date = requiredDate(value);
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}

export function monthRangeFor(value: string) {
  const start = requiredDate(firstOfMonth(value));
  return {
    startDate: localDateKey(start),
    endDateExclusive: localDateKey(
      new Date(start.getFullYear(), start.getMonth() + 1, 1, 12),
    ),
  };
}

export function calendarDaysForMonth(value: string): string[] {
  const start = requiredDate(firstOfMonth(value));
  const count = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
    12,
  ).getDate();
  return Array.from({ length: count }, (_, index) =>
    localDateKey(
      new Date(start.getFullYear(), start.getMonth(), index + 1, 12),
    ),
  );
}

function shiftMonth(value: string, amount: number): string {
  const start = requiredDate(firstOfMonth(value));
  return localDateKey(
    new Date(start.getFullYear(), start.getMonth() + amount, 1, 12),
  );
}

function weekdayIndex(value: string): number {
  return (requiredDate(value).getDay() + 6) % 7;
}

export function HistoryMonthCalendar({
  loadMonth,
  onOpenDay,
  initialMonth,
  todayDate = localDateKey(),
}: HistoryMonthCalendarProps) {
  const { t, i18n } = useTranslation('history');
  const { i18n: themeI18n } = useTranslation('theme');
  const locale =
    normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ??
    compatibilityLocale;
  const initialDate = initialMonth ?? todayDate;
  const [visibleMonth, setVisibleMonth] = useState(() =>
    firstOfMonth(initialDate),
  );
  const initialRange = monthRangeFor(initialDate);
  const [activeDate, setActiveDate] = useState(() =>
    todayDate >= initialRange.startDate &&
    todayDate < initialRange.endDateExclusive
      ? todayDate
      : initialRange.startDate,
  );
  const [summaries, setSummaries] = useState<CalendarDaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestId = useRef(0);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);
  const headingId = useId();
  const range = useMemo(() => monthRangeFor(visibleMonth), [visibleMonth]);
  const days = useMemo(
    () => calendarDaysForMonth(visibleMonth),
    [visibleMonth],
  );
  const summaryByDate = useMemo(
    () => new Map(summaries.map((summary) => [summary.date, summary])),
    [summaries],
  );
  const monthDate = requiredDate(visibleMonth);
  const monthLabel = formatDate(monthDate, locale, {
    month: 'long',
    year: 'numeric',
  });
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        formatDate(new Date(2024, 0, index + 1, 12), locale, {
          weekday: 'short',
        }),
      ),
    [locale],
  );

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let mounted = true;
    setLoading(true);
    setError(false);
    setSummaries([]);
    void loadMonth(range.startDate, range.endDateExclusive)
      .then((next) => {
        if (mounted && currentRequest === requestId.current) setSummaries(next);
      })
      .catch(() => {
        if (mounted && currentRequest === requestId.current) setError(true);
      })
      .finally(() => {
        if (mounted && currentRequest === requestId.current) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [loadMonth, range.endDateExclusive, range.startDate, retryAttempt]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    const element = dayRefs.current.get(target);
    if (!element) return;
    pendingFocus.current = null;
    element.focus();
  }, [visibleMonth]);

  const moveToMonth = (amount: number) => {
    const next = shiftMonth(visibleMonth, amount);
    setVisibleMonth(next);
    setActiveDate(next);
  };

  const focusDate = (target: string) => {
    setActiveDate(target);
    if (target < range.startDate || target >= range.endDateExclusive) {
      pendingFocus.current = target;
      setVisibleMonth(firstOfMonth(target));
      return;
    }
    dayRefs.current.get(target)?.focus();
  };

  const handleDayKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    date: string,
  ) => {
    let target: string | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        target = addLocalDays(date, -1);
        break;
      case 'ArrowRight':
        target = addLocalDays(date, 1);
        break;
      case 'ArrowUp':
        target = addLocalDays(date, -7);
        break;
      case 'ArrowDown':
        target = addLocalDays(date, 7);
        break;
      case 'Home':
        target = addLocalDays(date, -weekdayIndex(date));
        break;
      case 'End':
        target = addLocalDays(date, 6 - weekdayIndex(date));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onOpenDay(date);
        return;
      default:
        return;
    }
    event.preventDefault();
    focusDate(target);
  };

  return (
    <section className="history-calendar" aria-labelledby={headingId}>
      <div className="history-calendar-toolbar">
        <button
          type="button"
          aria-label={t('calendar.previousMonth')}
          title={t('calendar.previousMonth')}
          onClick={() => moveToMonth(-1)}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <h2 id={headingId}>{monthLabel}</h2>
        <button
          type="button"
          aria-label={t('calendar.nextMonth')}
          title={t('calendar.nextMonth')}
          onClick={() => moveToMonth(1)}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
      <div
        className="history-calendar-weekdays"
        aria-hidden="true"
        data-testid="calendar-weekdays"
      >
        {weekdayLabels.map((label, index) => (
          <span key={`${index}-${label}`}>{label}</span>
        ))}
      </div>
      <div
        className="history-calendar-days"
        role="group"
        aria-label={monthLabel}
      >
        {days.map((date, index) => {
          const summary = summaryByDate.get(date);
          const resolved = summary
            ? dayThemeRegistry.resolve(
                summary.themeId ?? null,
                summary.themeVersion ?? null,
              )
            : null;
          const themeName = resolved
            ? themeI18n.t(resolved.definition.nameKey)
            : null;
          const daySymbol = resolveStoredDaySymbol(summary?.daySymbol);
          const symbolName =
            daySymbol === null
              ? null
              : themeI18n.t(
                  `theme:${
                    daySymbolOptions.find((option) => option.id === daySymbol)
                      ?.labelKey ?? 'personalization.symbol.default'
                  }`,
                );
          const fullDate = formatLongLocalDate(date, locale);
          const accessibleName =
            summary && themeName
              ? t('calendar.accessibility.openLoggedDay', {
                  date: fullDate,
                  theme: symbolName ? `${themeName}, ${symbolName}` : themeName,
                })
              : t('calendar.accessibility.openEmptyDay', { date: fullDate });
          const selected = activeDate === date;
          const isToday = todayDate === date;
          const markerStyle = resolved
            ? ({
                '--calendar-theme-color':
                  resolved.definition.calendar.indicatorColor,
              } satisfies CalendarMarkerStyle)
            : undefined;
          const dayStyle: CalendarMarkerStyle = {
            ...markerStyle,
            ...(index === 0 ? { gridColumnStart: weekdayIndex(date) + 1 } : {}),
          };
          return (
            <button
              className="history-calendar-day"
              style={dayStyle}
              key={date}
              ref={(node) => {
                if (node) dayRefs.current.set(date, node);
                else dayRefs.current.delete(date);
              }}
              type="button"
              tabIndex={selected ? 0 : -1}
              aria-label={accessibleName}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={selected}
              data-selected={selected}
              data-today={isToday}
              data-has-log={Boolean(summary?.hasLog)}
              onFocus={() => setActiveDate(date)}
              onClick={() => onOpenDay(date)}
              onKeyDown={(event) => handleDayKeyDown(event, date)}
            >
              <span className="history-calendar-number">{index + 1}</span>
              {resolved && themeName && (
                <span
                  className="history-calendar-marker"
                  title={themeName}
                  aria-hidden="true"
                >
                  <i />
                  <span>
                    <DaySymbolIcon
                      symbol={daySymbol}
                      themeSymbol={resolved.definition.calendar.symbol}
                      size={11}
                    />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {loading && (
        <div
          className="history-calendar-status"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="spin" aria-hidden="true" size={16} />
          {t('calendar.loading')}
        </div>
      )}
      {!loading && error && (
        <div className="history-calendar-error" role="alert">
          <span>{t('calendar.loadError')}</span>
          <button
            type="button"
            onClick={() => setRetryAttempt((value) => value + 1)}
          >
            {t('common:actions.retry')}
          </button>
        </div>
      )}
    </section>
  );
}
