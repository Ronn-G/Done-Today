export default {
  foundation: { ready: 'Ready' },
  heading: {
    eyebrow: 'Looking back',
    title: 'History',
    subtitle: 'Each day you record becomes a small milestone.',
  },
  status: { loading: 'Loading history…', loadingMore: 'Loading…' },
  errors: { load: 'We couldn’t load your history.' },
  calendar: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    loading: 'Loading month…',
    loadError: 'We couldn’t load this month.',
    accessibility: {
      openLoggedDay: 'Open {{date}}. Journal recorded. Day theme: {{theme}}.',
      openEmptyDay: 'Open {{date}}. No journal recorded.',
    },
  },
  emptyState: {
    title: 'No journal days yet.',
    body: 'Days you record will appear here.',
  },
  summary: {
    daily_one:
      '{{count, integer}} task · {{completed, integer}} completed · {{percentage}}',
    daily_other:
      '{{count, integer}} tasks · {{completed, integer}} completed · {{percentage}}',
  },
  themeIdentity: 'Day theme: {{theme}}',
  actions: { goToToday: 'Go to Today', loadMore: 'Load more' },
  accessibility: {
    list: 'Journal days',
    openDay: 'Open {{date}}: {{summary}}. Day theme: {{theme}}.',
    completionRateForDay: 'Completion rate for {{date}}',
  },
  backendErrors: {
    paginationInvalid: 'The requested history page is invalid.',
  },
} as const;
