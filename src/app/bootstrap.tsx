import type { ReactNode } from 'react';
import type { AppLocale } from '../domain/localization/locale';
import type { LocaleService } from '../application/localization/localeService';

type RootLike = { render(node: ReactNode): void };
type BootstrapDependencies = {
  localeService: Pick<LocaleService, 'initialize'>;
  initializeI18n(locale: AppLocale): Promise<unknown>;
  renderApplication(): ReactNode;
  reportError(message: string, error: unknown): void;
};

export function BootstrapFailure({ retry }: { retry: () => Promise<void> }) {
  return (
    <main role="alert">
      <p>Unable to start the application. Please try again.</p>
      <button type="button" onClick={() => void retry()}>
        Retry
      </button>
    </main>
  );
}

export function createApplicationBootstrap(
  root: RootLike,
  dependencies: BootstrapDependencies,
) {
  let inFlight: Promise<void> | null = null;
  const execute = async () => {
    const resolution = await dependencies.localeService.initialize();
    if (resolution.source === 'readFailure')
      dependencies.reportError(
        'Unable to read the saved language preference.',
        resolution.error,
      );
    try {
      await dependencies.initializeI18n(resolution.locale);
      root.render(dependencies.renderApplication());
    } catch (error) {
      dependencies.reportError('Unable to initialize translations.', error);
      root.render(<BootstrapFailure retry={run} />);
    }
  };
  const run = () => {
    if (inFlight) return inFlight;
    inFlight = execute().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
  return { run };
}
