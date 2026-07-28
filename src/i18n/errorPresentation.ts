import {normalizeAppError, normalizeAppWarning} from '../application/errors/errorNormalizer';
import type {
  AppErrorCode,
  AppErrorParams,
  AppWarningCode,
  NormalizedAppError,
  NormalizedAppWarning,
} from '../domain/errors/appError';

export type ErrorTranslator = (
  key: string,
  options?: Record<string, string | number | boolean>,
) => string;

export function toErrorTranslator(translate: unknown): ErrorTranslator {
  const callable = translate as ErrorTranslator;
  return (key, options) => callable(key, options);
}

type PresentationDefinition = {
  key: string;
  required?: readonly string[];
  paramTypes?: Readonly<Record<string, 'string' | 'number' | 'boolean'>>;
};

export const appErrorPresentation = {
  'data.not_found': {key: 'messages.dataNotFound'},
  'database.unavailable': {key: 'messages.databaseUnavailable'},
  'localization.unsupported': {key: 'messages.localizationUnsupported'},
  'date.invalid': {key: 'messages.dateInvalid'},
  'work_item.task_too_long': {key: 'today:backendErrors.taskTooLong', required: ['max'], paramTypes: {max: 'number'}},
  'work_item.result_too_long': {key: 'today:backendErrors.resultTooLong', required: ['max'], paramTypes: {max: 'number'}},
  'work_item.next_action_too_long': {key: 'today:backendErrors.nextActionTooLong', required: ['max'], paramTypes: {max: 'number'}},
  'work_item.status_invalid': {key: 'today:backendErrors.statusInvalid'},
  'work_item.reorder_empty': {key: 'today:backendErrors.reorderEmpty'},
  'work_item.reorder_invalid': {key: 'today:backendErrors.reorderInvalid'},
  'category.name_invalid': {key: 'settings:categories.backendErrors.nameInvalid', required: ['min', 'max'], paramTypes: {min: 'number', max: 'number'}},
  'category.color_invalid': {key: 'settings:categories.backendErrors.colorInvalid'},
  'category.reorder_invalid': {key: 'settings:categories.backendErrors.reorderInvalid'},
  'history.pagination_invalid': {key: 'history:backendErrors.paginationInvalid'},
  'day_theme.metadata_invalid': {key: 'theme:backendErrors.dayThemeMetadataInvalid'},
  'theme.invalid': {key: 'theme:backendErrors.invalid'},
  'theme.too_large': {key: 'theme:backendErrors.tooLarge', required: ['maxKiB'], paramTypes: {maxKiB: 'number'}},
  'theme.schema_unsupported': {
    key: 'theme:backendErrors.schemaUnsupported',
    required: ['version', 'supportedVersion'],
    paramTypes: {version: 'number', supportedVersion: 'number'},
  },
  'theme.palette_invalid': {key: 'theme:backendErrors.paletteInvalid'},
  'theme.palette_incomplete': {key: 'theme:backendErrors.paletteIncomplete'},
  'theme.color_invalid': {key: 'theme:backendErrors.colorInvalid'},
  'theme.stored_corrupt': {key: 'theme:backendErrors.storedCorrupt'},
  'backup.create_failed': {key: 'backup:backendErrors.createFailed'},
  'backup.file_read_failed': {key: 'backup:backendErrors.fileReadFailed'},
  'backup.file_too_large': {key: 'backup:backendErrors.fileTooLarge', required: ['maxMiB'], paramTypes: {maxMiB: 'number'}},
  'backup.json_invalid': {key: 'backup:backendErrors.jsonInvalid'},
  'backup.version_missing': {key: 'backup:backendErrors.versionMissing'},
  'backup.version_newer': {
    key: 'backup:backendErrors.versionNewer',
    required: ['version', 'supportedVersion'],
    paramTypes: {version: 'number', supportedVersion: 'number'},
  },
  'backup.version_unsupported': {
    key: 'backup:backendErrors.versionUnsupported',
    required: ['version', 'supportedVersion'],
    paramTypes: {version: 'number', supportedVersion: 'number'},
  },
  'backup.structure_invalid': {key: 'backup:backendErrors.structureInvalid'},
  'backup.format_invalid': {key: 'backup:backendErrors.formatInvalid'},
  'backup.timestamp_invalid': {key: 'backup:backendErrors.timestampInvalid'},
  'backup.checksum_mismatch': {key: 'backup:backendErrors.checksumMismatch'},
  'backup.reference_invalid': {key: 'backup:backendErrors.referenceInvalid'},
  'backup.duplicate_id': {key: 'backup:backendErrors.duplicateId'},
  'backup.theme_invalid': {key: 'backup:backendErrors.themeInvalid'},
  'backup.destination_invalid': {key: 'backup:backendErrors.destinationInvalid'},
  'backup.file_write_failed': {key: 'backup:backendErrors.fileWriteFailed'},
  'backup.merge_unsafe': {key: 'backup:backendErrors.mergeUnsafe'},
  'backup.mapping_missing': {key: 'backup:backendErrors.mappingMissing'},
  'backup.reimport_confirmation_required': {
    key: 'backup:backendErrors.reimportConfirmationRequired',
  },
  'backup.receipt_write_failed': {key: 'backup:backendErrors.receiptWriteFailed'},
} satisfies Record<AppErrorCode, PresentationDefinition>;

export const appWarningPresentation = {
  'backup.warning.app_version': {
    key: 'backup:backendWarnings.appVersion',
    required: ['backupVersion', 'currentVersion'],
    paramTypes: {backupVersion: 'string', currentVersion: 'string'},
  },
  'backup.warning.previously_imported': {
    key: 'backup:backendWarnings.previouslyImported',
  },
} satisfies Record<AppWarningCode, PresentationDefinition>;

function hasRequiredParams(
  params: AppErrorParams,
  definition: PresentationDefinition,
): boolean {
  if (!(definition.required?.every(name => Object.hasOwn(params, name)) ?? true)) return false;
  return Object.entries(definition.paramTypes ?? {})
    .every(([name, expected]) => typeof params[name] === expected);
}

function present(
  value: NormalizedAppError | NormalizedAppWarning,
  definitions: Record<string, PresentationDefinition>,
  translate: ErrorTranslator,
): string {
  if (value.kind === 'unknown') return translate('messages.unknown');
  const definition = definitions[value.code];
  if (!definition || !hasRequiredParams(value.params, definition)) {
    return translate('messages.unknown');
  }
  return translate(definition.key, value.params);
}

export function localizeAppError(value: unknown, translate: ErrorTranslator): string {
  return present(normalizeAppError(value), appErrorPresentation, translate);
}

export function localizeAppWarning(value: unknown, translate: ErrorTranslator): string {
  return present(normalizeAppWarning(value), appWarningPresentation, translate);
}
