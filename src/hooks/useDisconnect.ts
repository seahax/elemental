import { useInternalController } from './useInternalController.ts';

/** Register a callback for disconnections. */
export function useDisconnectCallback(callback: () => void): void {
  useInternalController().onDisconnect.push(callback);
}
