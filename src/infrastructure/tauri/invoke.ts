import { invoke } from '@tauri-apps/api/core';
import { normalizeAppError } from '../../application/errors/errorNormalizer';

export type InvokeCommand = (
  command: string,
  args?: Record<string, unknown>,
) => Promise<unknown>;

export async function invokeWithAppError<T>(
  invokeCommand: InvokeCommand,
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  try {
    return (await (args === undefined
      ? invokeCommand(command)
      : invokeCommand(command, args))) as T;
  } catch (reason) {
    throw normalizeAppError(reason);
  }
}

const coreInvoke: InvokeCommand = (command, args) =>
  args === undefined ? invoke(command) : invoke(command, args);

export const invokeTauriCommand = <T>(
  command: string,
  args?: Record<string, unknown>,
) => invokeWithAppError<T>(coreInvoke, command, args);
