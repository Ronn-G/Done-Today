export default {
  settings: {
    title: 'Backup and restore',
    description:
      'Your data stays local. Use a JSON file to move or restore your journal.',
    privacyWarning:
      'Backup files may contain journal entries and personal data. Store them somewhere safe.',
  },
  export: {
    action: 'Export backup',
    success: 'Saved {{fileName}}: {{summary}}.',
    summary: {
      dailyLogs_one: '{{count, integer}} journal day',
      dailyLogs_other: '{{count, integer}} journal days',
      workItems_one: '{{count, integer}} task',
      workItems_other: '{{count, integer}} tasks',
      workCategories_one: '{{count, integer}} category',
      workCategories_other: '{{count, integer}} categories',
      themeIncluded: 'appearance settings included',
      themeExcluded: 'no appearance settings included',
    },
  },
  import: {
    action: 'Restore from backup',
    submit: 'Import backup',
    submitting: 'Importing…',
    success: 'Restored {{summary}}.',
    summary: {
      dailyLogs_one: '{{count, integer}} journal day',
      dailyLogs_other: '{{count, integer}} journal days',
      workItems_one: '{{count, integer}} task',
      workItems_other: '{{count, integer}} tasks',
      remapped_one: 'remapped {{count, integer}} ID',
      remapped_other: 'remapped {{count, integer}} IDs',
    },
  },
  preview: {
    title: 'Preview backup',
    metadata: {
      format: 'Format',
      exportedAt: 'Exported',
      appVersion: 'App version',
      checksum: 'Checksum',
      data: 'Data',
      dryRun: 'Change preview',
    },
    checksum: { valid: 'Valid', invalid: 'Invalid' },
    data: {
      dailyLogs_one: '{{count, integer}} journal day',
      dailyLogs_other: '{{count, integer}} journal days',
      workItems_one: '{{count, integer}} task',
      workItems_other: '{{count, integer}} tasks',
      workCategories_one: '{{count, integer}} category',
      workCategories_other: '{{count, integer}} categories',
      themeIncluded: 'appearance settings included',
      themeExcluded: 'no appearance settings included',
    },
    dryRun: {
      newRecords_one: '{{count, integer}} new record',
      newRecords_other: '{{count, integer}} new records',
      existingIds_one: '{{count, integer}} existing ID',
      existingIds_other: '{{count, integer}} existing IDs',
      conflicts_one: '{{count, integer}} conflict',
      conflicts_other: '{{count, integer}} conflicts',
      unchanged_one: '{{count, integer}} unchanged record',
      unchanged_other: '{{count, integer}} unchanged records',
    },
  },
  mode: {
    legend: 'Restore mode',
    merge: {
      label: 'Merge',
      description:
        'Keep your current data and add non-duplicate data from the backup.',
    },
    replace: {
      label: 'Replace all',
      description:
        'Replace all current journal entries, categories, and appearance settings.',
    },
  },
  confirm: {
    reimport:
      'I understand this file was imported on {{dateTime}} and want to import it again.',
    replace: {
      title: 'Confirm replacement of all data',
      body: 'I understand that all current journal entries, categories, and appearance settings will be replaced. If anything fails, no changes will be applied.',
    },
  },
  options: { applyTheme: 'Apply appearance settings from the backup' },
  status: { preparing: 'Preparing…', restoring: 'Restoring…' },
  dialog: {
    exportTitle: 'Export Done Today backup',
    importTitle: 'Restore from backup',
    filterName: 'Done Today backup',
  },
  backendErrors: {
    createFailed: 'The backup could not be created.',
    fileReadFailed: 'The backup file could not be read.',
    fileTooLarge: 'The backup file must be no larger than {{maxMiB}} MiB.',
    jsonInvalid: 'The selected file is not valid JSON.',
    versionMissing: 'The backup version is missing.',
    versionNewer:
      'Backup version {{version}} is newer than the supported version {{supportedVersion}}.',
    versionUnsupported:
      'Backup version {{version}} is not supported. Supported version: {{supportedVersion}}.',
    structureInvalid: 'The backup structure is invalid.',
    formatInvalid: 'This is not a Done Today backup.',
    timestampInvalid: 'The backup contains an invalid timestamp.',
    checksumMismatch:
      'The backup checksum does not match. The file may have been modified.',
    referenceInvalid: 'The backup contains a broken data reference.',
    duplicateId: 'The backup contains a duplicate identifier.',
    themeInvalid: 'The theme stored in the backup is invalid.',
    destinationInvalid: 'The selected backup location is invalid.',
    fileWriteFailed:
      'The backup file could not be written. Choose another location.',
    mergeUnsafe: 'This backup cannot be merged safely.',
    mappingMissing: 'The backup data could not be mapped for import.',
    reimportConfirmationRequired:
      'Confirm that you want to import this backup again.',
    receiptWriteFailed:
      'The import completed, but its receipt could not be prepared.',
  },
  backendWarnings: {
    appVersion:
      'This backup was created by Done Today {{backupVersion}}; you are using {{currentVersion}}.',
    previouslyImported: 'This backup has been imported before.',
  },
} as const;
