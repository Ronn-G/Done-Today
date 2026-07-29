import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './app/App';
import { LocaleService } from './application/localization/localeService';
import { TauriLocaleRepository } from './infrastructure/database/tauriLocaleRepository';
import { initializeI18n } from './i18n';
import { createApplicationBootstrap } from './app/bootstrap';

const root = createRoot(document.getElementById('root')!);
const bootstrap = createApplicationBootstrap(root, {
  localeService: new LocaleService(new TauriLocaleRepository()),
  initializeI18n,
  renderApplication: () => (
    <StrictMode>
      <App />
    </StrictMode>
  ),
  reportError: (message, error) => console.error(message, error),
});
void bootstrap.run();
