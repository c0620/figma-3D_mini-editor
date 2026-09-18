import { randomUUID } from "../../lib/randomId";

import { useSessionStore } from "../../store/sessionStore";
import { AppError } from "./errors";
import { Success } from "./success";
import type { Notification } from "./types";
import { Warning } from "./warnings";

export class NotificationService {
  removeByContext(contextID: string) {
    const notifications = useSessionStore.getState().notifications;
    const actualNotifications = notifications.filter(
      (n) => n.contextId != contextID
    );
    useSessionStore.setState({ notifications: actualNotifications });
    console.log(useSessionStore.getState().notifications);
  }

  push(input: Notification | Warning | AppError | Success, contextId: string) {
    const base = { id: randomUUID(), contextId, createdAt: Date.now() };

    let notification: Notification;
    if (input instanceof Success) {
      notification = { ...base, type: "success", code: input.code };
    } else if (input instanceof Warning) {
      notification = {
        ...base,
        type: "warning",
        code: input.code,
        source: input.source,
        nodeType: input.nodeType,
      };
    } else if (input instanceof AppError)
      notification = { ...base, type: "error", code: input.code };
    else {
      notification = input;
    }
    useSessionStore.getState().pushNotification(notification);
  }

  close(id: string): void {
    useSessionStore.getState().removeNotification(id);
  }
}
