import {useEffect, useId, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent, MouseEvent} from 'react';
import {Check, RotateCcw, X} from 'lucide-react';
import type {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';
import {DEFAULT_DAY_THEME_ID} from '../../domain/day-theme/definitions';
import {dayThemeRegistry} from '../../domain/day-theme/registry';
import type {DayThemeDefinition} from '../../domain/day-theme/models';
import type {DayThemeMetadata} from '../../domain/journal/models';

export type DayThemePickerProps = {
  persisted: DayThemeMetadata;
  onPreview: (metadata: DayThemeMetadata) => void;
  onRollbackPreview: () => void;
  onApply: (metadata: DayThemeMetadata) => Promise<void>;
  onApplied: (metadata: DayThemeMetadata) => void;
  onCancel: () => void;
};

function choiceFor(definition: DayThemeDefinition): DayThemeMetadata {
  return definition.id === DEFAULT_DAY_THEME_ID
    ? {themeId: null, themeVersion: null}
    : {themeId: definition.id, themeVersion: definition.version};
}

function runtimeSelectionId(persisted: DayThemeMetadata): string {
  return dayThemeRegistry.resolve(persisted.themeId, persisted.themeVersion).definition.id;
}

function translatedThemeCopy(id: string, t: TFunction<'theme'>): {name: string; description: string} {
  switch (id) {
    case 'sakura':
      return {name: t('dayTheme.sakura.name'), description: t('dayTheme.sakura.description')};
    case 'coffee':
      return {name: t('dayTheme.coffee.name'), description: t('dayTheme.coffee.description')};
    case 'rainy':
      return {name: t('dayTheme.rainy.name'), description: t('dayTheme.rainy.description')};
    default:
      return {
        name: t('dayTheme.doneTodayDefault.name'),
        description: t('dayTheme.doneTodayDefault.description'),
      };
  }
}

export function DayThemePicker({
  persisted,
  onPreview,
  onRollbackPreview,
  onApply,
  onApplied,
  onCancel,
}: DayThemePickerProps) {
  const {t} = useTranslation('theme');
  const definitions = useMemo(() => dayThemeRegistry.list(), []);
  const selectedId = runtimeSelectionId(persisted);
  const [draftId, setDraftId] = useState(selectedId);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    itemRefs.current[definitions.findIndex(theme => theme.id === selectedId)]?.focus();
    return () => returnFocus?.focus();
  }, [definitions, selectedId]);

  const selectDraft = (definition: DayThemeDefinition) => {
    setDraftId(definition.id);
    setFailed(false);
    onPreview(choiceFor(definition));
  };
  const restoreDraftPreview = () => {
    const definition = definitions.find(theme => theme.id === draftId);
    if (definition) onPreview(choiceFor(definition));
  };
  const cancel = () => {
    if (saving) return;
    onRollbackPreview();
    onCancel();
  };
  const apply = async () => {
    if (saving) return;
    const definition = definitions.find(theme => theme.id === draftId);
    if (!definition) return;
    const intended = choiceFor(definition);
    setSaving(true);
    setFailed(false);
    onPreview(intended);
    try {
      await onApply(intended);
      onApplied(intended);
    } catch {
      setFailed(true);
      onRollbackPreview();
    } finally {
      setSaving(false);
    }
  };
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter(element => !element.hasAttribute('hidden'));
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = (index + delta + definitions.length) % definitions.length;
    selectDraft(definitions[next]);
    itemRefs.current[next]?.focus();
  };
  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) cancel();
  };
  const defaultDefinition = definitions.find(theme => theme.id === DEFAULT_DAY_THEME_ID);

  return <div className="dialog-backdrop day-theme-picker-backdrop" role="presentation" onMouseDown={handleBackdrop}>
    <section
      ref={dialogRef}
      className="day-theme-picker-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={handleDialogKeyDown}
    >
      <header className="day-theme-picker-heading">
        <div><h2 id={titleId}>{t('dayTheme.picker.title')}</h2><p id={descriptionId}>{t('dayTheme.picker.description')}</p></div>
        <button type="button" className="day-theme-picker-close" aria-label={t('dayTheme.picker.close')} disabled={saving} onClick={cancel}><X aria-hidden="true" size={18}/></button>
      </header>
      <div className="day-theme-picker-grid" role="radiogroup" aria-label={t('dayTheme.picker.optionsLabel')}>
        {definitions.map((definition, index) => {
          const isDraft = definition.id === draftId;
          const isCurrent = definition.id === selectedId;
          const copy = translatedThemeCopy(definition.id, t);
          return <button
            key={`${definition.id}@${definition.version}`}
            ref={element => {itemRefs.current[index] = element}}
            type="button"
            role="radio"
            aria-checked={isDraft}
            className={`day-theme-picker-item${isDraft ? ' draft' : ''}${isCurrent ? ' current' : ''}`}
            onClick={() => selectDraft(definition)}
            onFocus={() => selectDraft(definition)}
            onMouseEnter={() => onPreview(choiceFor(definition))}
            onMouseLeave={restoreDraftPreview}
            onKeyDown={event => handleItemKeyDown(event, index)}
          >
            <span className="day-theme-picker-thumbnail" aria-hidden="true" style={{background: definition.cover.fallbackGradient}}/>
            <span className="day-theme-picker-item-copy">
              <strong>{copy.name}</strong>
              <span>{copy.description}</span>
              <span className="day-theme-picker-item-state">
                {isCurrent && <span><Check aria-hidden="true" size={14}/> {t('dayTheme.picker.current')}</span>}
                {isDraft && !isCurrent && <span>{t('dayTheme.picker.preview')}</span>}
              </span>
            </span>
          </button>;
        })}
      </div>
      {failed && <div className="day-theme-picker-error" role="alert">
        <span>{t('dayTheme.picker.saveFailed')}</span>
        <button type="button" disabled={saving} onClick={() => void apply()}>{t('common:actions.retry')}</button>
      </div>}
      <div className="day-theme-picker-actions">
        <button type="button" className="day-theme-picker-default" disabled={saving || !defaultDefinition} onClick={() => defaultDefinition && selectDraft(defaultDefinition)}>
          <RotateCcw aria-hidden="true" size={16}/> {t('dayTheme.picker.useDefault')}
        </button>
        <span className="day-theme-picker-spacer"/>
        <button type="button" disabled={saving} onClick={cancel}>{t('common:actions.cancel')}</button>
        <button type="button" className="day-theme-picker-apply" disabled={saving} aria-busy={saving} onClick={() => void apply()}>
          {saving ? t('dayTheme.picker.saving') : t('dayTheme.picker.apply')}
        </button>
      </div>
    </section>
  </div>;
}

export default DayThemePicker;
