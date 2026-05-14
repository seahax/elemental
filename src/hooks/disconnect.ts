import { useController } from './controller.ts';

/** Register a callback for disconnections. */
export function useDisconnectCallback(callback: () => void): void {
  useController().onDisconnect.push(callback);
}
