import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  coverVariantOptions,
  dayPersonalizationSchema,
  daySymbolOptions,
  journalFontRoleOptions,
  type DayPersonalization,
} from '../../domain/day-theme/personalization';
import { DaySymbolIcon } from './DaySymbolIcon';

type PersonalizationLabelKey =
  | (typeof coverVariantOptions)[number]['labelKey']
  | (typeof daySymbolOptions)[number]['labelKey']
  | (typeof journalFontRoleOptions)[number]['labelKey'];
type PersonalizationSectionKey = 'cover' | 'symbol' | 'font';

export type DayPersonalizationDialogProps = {
  persisted: DayPersonalization;
  themeSymbol?: string;
  onPreview: (value: DayPersonalization) => void;
  onRollbackPreview: () => void;
  onApply: (value: DayPersonalization) => Promise<void>;
  onApplied: (value: DayPersonalization) => void;
  onCancel: () => void;
};

function same(left: DayPersonalization, right: DayPersonalization): boolean {
  return (
    left.coverVariant === right.coverVariant &&
    left.daySymbol === right.daySymbol &&
    left.journalFontRole === right.journalFontRole
  );
}

export function DayPersonalizationDialog({
  persisted,
  themeSymbol,
  onPreview,
  onRollbackPreview,
  onApply,
  onApplied,
  onCancel,
}: DayPersonalizationDialogProps) {
  const { t } = useTranslation('theme');
  const [draft, setDraft] = useState(persisted);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const previewActive = useRef(false);
  const rollbackRef = useRef(onRollbackPreview);

  useEffect(() => {
    rollbackRef.current = onRollbackPreview;
  }, [onRollbackPreview]);
  useEffect(() => {
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    firstChoiceRef.current?.focus();
    return () => {
      if (previewActive.current) rollbackRef.current();
      returnFocus?.focus();
    };
  }, []);

  const preview = (next: DayPersonalization) => {
    previewActive.current = true;
    setDraft(next);
    setFailed(false);
    onPreview(next);
  };
  const rollback = () => {
    if (!previewActive.current) return;
    previewActive.current = false;
    onRollbackPreview();
  };
  const cancel = () => {
    if (saving) return;
    rollback();
    onCancel();
  };
  const apply = async () => {
    if (saving) return;
    const intended = dayPersonalizationSchema.parse(draft);
    setSaving(true);
    setFailed(false);
    previewActive.current = true;
    onPreview(intended);
    try {
      await onApply(intended);
      previewActive.current = false;
      onApplied(intended);
    } catch {
      setFailed(true);
      rollback();
    } finally {
      setSaving(false);
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? []),
    ];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) {
      event.preventDefault();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const handleRadioKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    group: readonly { id: string | null }[],
    current: string | null,
    section: PersonalizationSectionKey,
  ) => {
    if (
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    )
      return;
    event.preventDefault();
    const index = group.findIndex((option) => option.id === current);
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = group[(index + delta + group.length) % group.length];
    selectOption(section, next.id);
    const groupNode = event.currentTarget.closest('[role="radiogroup"]');
    groupNode
      ?.querySelector<HTMLButtonElement>(
        `[data-option-id="${next.id ?? 'default'}"]`,
      )
      ?.focus();
  };
  const backdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) cancel();
  };
  const optionLabel = (key: PersonalizationLabelKey) => {
    switch (key) {
      case 'personalization.cover.minimal':
        return t('personalization.cover.minimal');
      case 'personalization.symbol.default':
        return t('personalization.symbol.default');
      case 'personalization.symbol.none':
        return t('personalization.symbol.none');
      case 'personalization.symbol.sparkle':
        return t('personalization.symbol.sparkle');
      case 'personalization.symbol.focus':
        return t('personalization.symbol.focus');
      case 'personalization.symbol.growth':
        return t('personalization.symbol.growth');
      case 'personalization.symbol.calm':
        return t('personalization.symbol.calm');
      case 'personalization.symbol.celebrate':
        return t('personalization.symbol.celebrate');
      case 'personalization.font.default':
        return t('personalization.font.default');
      case 'personalization.font.ui':
        return t('personalization.font.ui');
      case 'personalization.font.journal':
        return t('personalization.font.journal');
      default:
        return t('personalization.cover.default');
    }
  };
  const selectOption = (
    section: PersonalizationSectionKey,
    id: string | null,
  ) => {
    if (section === 'cover')
      preview({
        ...draft,
        coverVariant: id as DayPersonalization['coverVariant'],
      });
    else if (section === 'symbol')
      preview({
        ...draft,
        daySymbol: id as DayPersonalization['daySymbol'],
      });
    else
      preview({
        ...draft,
        journalFontRole: id as DayPersonalization['journalFontRole'],
      });
  };
  const sections = [
    {
      key: 'cover' as const,
      label: t('personalization.cover.heading'),
      options: coverVariantOptions,
      current: draft.coverVariant,
    },
    {
      key: 'symbol' as const,
      label: t('personalization.symbol.heading'),
      options: daySymbolOptions,
      current: draft.daySymbol,
    },
    {
      key: 'font' as const,
      label: t('personalization.font.heading'),
      options: journalFontRoleOptions,
      current: draft.journalFontRole,
    },
  ];

  return (
    <div
      className="dialog-backdrop day-personalization-backdrop"
      role="presentation"
      onMouseDown={backdrop}
    >
      <section
        ref={dialogRef}
        className="day-personalization-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
      >
        <header className="day-theme-picker-heading">
          <div>
            <h2 id={titleId}>{t('personalization.title')}</h2>
            <p id={descriptionId}>{t('personalization.description')}</p>
          </div>
          <button
            type="button"
            className="day-theme-picker-close"
            aria-label={t('personalization.close')}
            disabled={saving}
            onClick={cancel}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <div className="day-personalization-sections">
          {sections.map((section, sectionIndex) => (
            <fieldset key={section.key}>
              <legend>{section.label}</legend>
              <div
                className="day-personalization-options"
                role="radiogroup"
                aria-label={section.label}
              >
                {section.options.map((option, optionIndex) => {
                  const selected = option.id === section.current;
                  return (
                    <button
                      key={option.id ?? 'default'}
                      ref={
                        sectionIndex === 0 && optionIndex === 0
                          ? firstChoiceRef
                          : undefined
                      }
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={selected ? 'selected' : ''}
                      data-option-id={option.id ?? 'default'}
                      onClick={() => selectOption(section.key, option.id)}
                      onKeyDown={(event) =>
                        handleRadioKeyDown(
                          event,
                          section.options,
                          section.current,
                          section.key,
                        )
                      }
                    >
                      {section.key === 'symbol' && (
                        <span className="day-personalization-symbol">
                          <DaySymbolIcon
                            symbol={
                              option.id as DayPersonalization['daySymbol']
                            }
                            themeSymbol={themeSymbol}
                          />
                        </span>
                      )}
                      <span>{optionLabel(option.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="day-personalization-preview" aria-live="polite">
          {same(draft, persisted)
            ? t('personalization.current')
            : t('personalization.preview')}
        </div>
        {failed && (
          <div className="day-theme-picker-error" role="alert">
            <span>{t('personalization.saveFailed')}</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => void apply()}
            >
              {t('common:actions.retry')}
            </button>
          </div>
        )}
        <div className="day-theme-picker-actions">
          <button
            type="button"
            className="day-theme-picker-default"
            disabled={saving}
            onClick={() =>
              preview({
                coverVariant: null,
                daySymbol: null,
                journalFontRole: null,
              })
            }
          >
            <RotateCcw aria-hidden="true" size={16} />
            {t('personalization.useDefaults')}
          </button>
          <span className="day-theme-picker-spacer" />
          <button type="button" disabled={saving} onClick={cancel}>
            {t('common:actions.cancel')}
          </button>
          <button
            type="button"
            className="day-theme-picker-apply"
            disabled={saving}
            aria-busy={saving}
            onClick={() => void apply()}
          >
            {saving ? t('personalization.saving') : t('personalization.apply')}
          </button>
        </div>
      </section>
    </div>
  );
}

export default DayPersonalizationDialog;
