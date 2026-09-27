import { randomUUID } from "../../lib/randomId";

import { useSessionStore } from "../../store/sessionStore";
import { AppError } from "./errors";
import { Success } from "./success";
import type { Notification, StackedNotification } from "./types";
import { Warning } from "./warnings";

export class NotificationService {
  removeByContext(contextID: string) {
    const notifications = useSessionStore.getState().notifications;
    const actualNotifications = notifications.filter(
      (n) => n.contextId != contextID,
    );
    useSessionStore.setState({ notifications: actualNotifications });
  }

  toStackedNotification(
    input: Notification | Success | Warning | AppError,
    contextId: string,
  ): StackedNotification {
    let notification: StackedNotification = {
      id: randomUUID(),
      contextId: contextId,
      createdAt: Date.now(),
      count: 1,
      type: input.type,
      code: input.code,
    };

    if ("source" in input && input.source) {
      notification.content = [{ source: input.source }];
      if ("nodeType" in input && input.nodeType) {
        notification.content[0].nodeType = input.nodeType;
      }
    }

    return notification;
  }

  push(input: Notification | Success | Warning | AppError, contextId: string) {
    let notification = this.toStackedNotification(input, contextId);
    useSessionStore.getState().pushNotification(notification);
  }

  pushStacked(input: StackedNotification) {
    useSessionStore.getState().pushNotification(input);
  }

  removeById(id: string): void {
    useSessionStore.getState().removeNotification(id);
  }
}
