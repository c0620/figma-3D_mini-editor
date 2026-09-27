import { Warning } from "./warnings";
import { randomUUID } from "@/lib/randomId";
import type { NotificationService } from "./notificationService";
import type {
  DecisionQuestion,
  Notification,
  OperationType,
  StackedNotification,
} from "./types";
import { Success } from "./success";
import { CancelError, AppError } from "./errors";
import { useSessionStore } from "@/store/sessionStore";

export class OperationContext {
  private readonly controller = new AbortController();
  private readonly logs: (Notification | Success | Warning | AppError)[] = [];
  private readonly cachedAnswers = new Map<
    DecisionQuestion["error"]["code"],
    DecisionQuestion
  >();
  private readonly notifications: NotificationService;
  readonly ofType: OperationType;
  readonly id: string;

  constructor(ofType: OperationType, notifications: NotificationService) {
    this.ofType = ofType;
    this.id = randomUUID();
    this.notifications = notifications;
  }

  log = (instance: Notification | Success | Warning | AppError) => {
    if (this.controller.signal.aborted) return;
    this.logs.push(instance);
  };

  pushLogs() {
    let stackedNotifications: Record<
      Notification["code"],
      StackedNotification
    > = {} as Record<Notification["code"], StackedNotification>;

    this.logs.forEach((input) => {
      if (input.code in stackedNotifications) {
        stackedNotifications[input.code].count += 1;
        if ("source" in input) {
          stackedNotifications[input.code].content
            ? stackedNotifications[input.code].content!.push({
                source: input.source,
                nodeType: input.nodeType,
              })
            : (stackedNotifications[input.code].content = [
                {
                  source: input.source,
                  nodeType: input.nodeType,
                },
              ]);
        }
        return;
      }
      stackedNotifications[input.code] =
        this.notifications.toStackedNotification(input, this.id);
    });
    Object.values(stackedNotifications).forEach((n) => {
      this.notifications.pushStacked(n);
    });
  }

  private async queueQuestion(q: DecisionQuestion) {
    return new Promise<DecisionQuestion>((resolve, reject) =>
      useSessionStore.getState().pushDecision({
        ...q,
        contextId: this.id,
        resolve,
        reject: (abort: boolean = true) => {
          {
            if (abort) this.abort();
            reject(new CancelError("cancelled by user"));
          }
        },
      }),
    );
  }

  ask = async (question: Omit<DecisionQuestion, "contextId">) => {
    this.controller.signal.throwIfAborted();
    if (this.cachedAnswers.has(question.error.code)) {
      return this.cachedAnswers.get(question.error.code)!;
    }
    const answer = await this.queueQuestion({
      ...question,
      contextId: this.id,
    });
    this.cachedAnswers.set(question.error.code, answer);
    return answer;
  };

  isAborted() {
    return this.controller.signal.aborted;
  }

  abort() {
    this.notifications.removeByContext(this.id);

    let abortedDecision = useSessionStore
      .getState()
      .decisions.filter((q) => q.contextId == this.id);
    abortedDecision.forEach((q) => q.reject(false));

    let actualDecisions = useSessionStore
      .getState()
      .decisions.filter((q) => q.contextId != this.id);
    useSessionStore.setState({ decisions: actualDecisions });

    this.controller.abort();
  }
}
