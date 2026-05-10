import type { Notification } from "../types/ui";

export class NotificationService {
  notifications: Notification[] = [];

  pushSuccess(message: string): string {
    const id = crypto.randomUUID();
    this.notifications.push({
      id,
      type: "Success",
      message,
      reason: null,
      createdAt: Date.now(),
    });
    return id;
  }

  pushError(message: string, reason: string): string {
    const id = crypto.randomUUID();
    this.notifications.push({
      id,
      type: "Error",
      message,
      reason,
      createdAt: Date.now(),
    });
    return id;
  }

  close(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
