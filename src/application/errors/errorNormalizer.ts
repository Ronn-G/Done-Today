import {
  appErrorCodes,
  appWarningCodes,
  type AppErrorCode,
  type AppErrorParam,
  type AppErrorParams,
  type AppWarningCode,
  type NormalizedAppError,
  type NormalizedAppWarning,
} from '../../domain/errors/appError';

const errorCodes = new Set<string>(appErrorCodes);
const warningCodes = new Set<string>(appWarningCodes);

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    return record(JSON.parse(value));
  } catch {
    return null;
  }
}

function payload(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') return parseJsonObject(value);
  if (value instanceof Error) return parseJsonObject(value.message);
  return record(value);
}

function params(value: unknown): AppErrorParams | null {
  if (value === undefined) return {};
  const source = record(value);
  if (!source) return null;
  const parsed: Record<string, AppErrorParam> = {};
  for (const [key, entry] of Object.entries(source)) {
    if (
      typeof entry !== 'string' &&
      typeof entry !== 'number' &&
      typeof entry !== 'boolean'
    )
      return null;
    parsed[key] = entry;
  }
  return parsed;
}

export function normalizeAppError(value: unknown): NormalizedAppError {
  if (isNormalizedAppError(value)) return value;
  const candidate = payload(value);
  if (
    !candidate ||
    typeof candidate.code !== 'string' ||
    !errorCodes.has(candidate.code)
  ) {
    return { kind: 'unknown' };
  }
  const parsedParams = params(candidate.params);
  if (!parsedParams) return { kind: 'unknown' };
  return {
    kind: 'known',
    code: candidate.code as AppErrorCode,
    params: parsedParams,
  };
}

export function normalizeAppWarning(value: unknown): NormalizedAppWarning {
  const candidate = payload(value);
  if (
    !candidate ||
    typeof candidate.code !== 'string' ||
    !warningCodes.has(candidate.code)
  ) {
    return { kind: 'unknown' };
  }
  const parsedParams = params(candidate.params);
  if (!parsedParams) return { kind: 'unknown' };
  return {
    kind: 'known',
    code: candidate.code as AppWarningCode,
    params: parsedParams,
  };
}

export function isNormalizedAppError(
  value: unknown,
): value is NormalizedAppError {
  const candidate = record(value);
  if (
    !candidate ||
    (candidate.kind !== 'known' && candidate.kind !== 'unknown')
  )
    return false;
  if (candidate.kind === 'unknown') return true;
  return (
    typeof candidate.code === 'string' &&
    errorCodes.has(candidate.code) &&
    params(candidate.params) !== null
  );
}
