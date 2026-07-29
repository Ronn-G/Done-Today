import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { normalizeAppError } from '../../application/errors/errorNormalizer';

export type InvokeCommand = (
  command: string,
  args?: Record<string, unknown>,
) => Promise<unknown>;

export const tauriVoidSchema = z
  .union([z.null(), z.undefined()])
  .transform(() => undefined);

function reportInvalidResponse(
  command: string,
  issues: ReadonlyArray<{ code: string; path: PropertyKey[] }>,
) {
  if (!import.meta.env.DEV) return;
  console.error(
    'Invalid Tauri response',
    command,
    issues.map((issue) => ({ code: issue.code, path: issue.path })),
  );
}

export async function invokeAndParse<T>(
  invokeCommand: InvokeCommand,
  command: string,
  args: Record<string, unknown> | undefined,
  responseSchema: z.ZodType<T>,
): Promise<T> {
  let response: unknown;
  try {
    response = await (args === undefined
      ? invokeCommand(command)
      : invokeCommand(command, args));
  } catch (reason) {
    throw normalizeAppError(reason);
  }

  const parsed = responseSchema.safeParse(response);
  if (parsed.success) return parsed.data;
  reportInvalidResponse(command, parsed.error.issues);
  throw normalizeAppError(undefined);
}

const coreInvoke: InvokeCommand = (command, args) =>
  args === undefined ? invoke(command) : invoke(command, args);

export const invokeTauriCommand = <T>(
  command: string,
  args: Record<string, unknown> | undefined,
  responseSchema: z.ZodType<T>,
) => invokeAndParse(coreInvoke, command, args, responseSchema);
