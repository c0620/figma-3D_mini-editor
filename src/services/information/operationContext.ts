import type { Warning } from "./warnings";
import { randomUUID } from "@/lib/randomId";
import type { NotificationService } from "./notificationService";
import type { DecisionQuestion, Notification, OperationType } from "./types";
import type { Success } from "./success";
import { CancelError, type AppError } from "./errors";
import { useSessionStore } from "@/store/sessionStore";

export class OperationContext {
  private readonly controller = new AbortController();
  private readonly logs: (Notification | Success | Warning | AppError)[] = [];
  private readonly cachedAnswers = new Map<
    DecisionQuestion["error"]["name"],
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
    this.logs.map((w) => this.notifications.push(w, this.id));
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
      })
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
