import { randomUUID } from '../lib/randomId';

import { useUiStore } from './uiStore';

export class NotificationService {
  pushSuccess(message: string): string {
    const id = randomUUID();
    useUiStore.getState().pushNotification({
      id,
      type: 'Success',
      message,
      reason: null,
      createdAt: Date.now(),
    });
    return id;
  }

  pushError(message: string, reason: string): string {
    const id = randomUUID();
    useUiStore.getState().pushNotification({
      id,
      type: 'Error',
      message,
      reason,
      createdAt: Date.now(),
    });
    return id;
  }

  close(id: string): void {
    useUiStore.getState().removeNotification(id);
  }
}
