import { randomUUID } from "../lib/randomId";

import { useSessionStore } from "../store/sessionStore";

export class NotificationService {
  pushSuccess(message: string): string {
    const id = randomUUID();
    useSessionStore.getState().pushNotification({
      id,
      type: "Success",
      message,
      reason: null,
      createdAt: Date.now(),
    });
    return id;
  }

  pushError(message: string, reason: string): string {
    const id = randomUUID();
    useSessionStore.getState().pushNotification({
      id,
      type: "Error",
      message,
      reason,
      createdAt: Date.now(),
    });
    return id;
  }

  close(id: string): void {
    useSessionStore.getState().removeNotification(id);
  }
}
