import { Warning } from "./warnings";
import { randomUUID } from "@/lib/randomId";
import type { NotificationService } from "./notificationService";
import type {
  DecisionByCode,
  Notification,
  OperationType,
  PendingQuestion,
  PendingQuestionByCode,
  StackedNotification,
} from "./types";
import { Success } from "./success";
import { CancelError, AppError, QuestionCode } from "./errors";
import { useSessionStore } from "@/store/sessionStore";
import type { DecisionRequiredError } from "./decisions";

type DecisionQuestionInputByCode = {
  [C in QuestionCode]: Omit<DecisionByCode[C]["question"], "contextId">;
};
type CachedAnswers = Partial<{
  [C in QuestionCode]: DecisionByCode[C]["answer"];
}>;

export class OperationContext {
  private readonly controller = new AbortController();
  private readonly logs: (Notification | Success | Warning | AppError)[] = [];
  private readonly cachedAnswers = new Map<
    QuestionCode,
    Promise<DecisionByCode[QuestionCode]["answer"]>
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

  private queueQuestion<C extends QuestionCode>(
    question: DecisionRequiredError<C>
  ) {
    return new Promise<DecisionByCode[C]["answer"]>((resolve, reject) => {
      const pending = {
        contextId: this.id,
        id: question.id,
        error: question,
        choices: question.choices,

        resolve: (value: DecisionByCode[C]["answer"]) => {
          resolve(value);
        },

        reject: (abort: boolean = true) => {
          if (abort) this.abort();
          reject(new CancelError("cancelled by user"));
        },
      } as PendingQuestion;

      useSessionStore.getState().pushDecision(pending);
    });
  }

  ask = async <C extends QuestionCode>(
    question: DecisionRequiredError<C>
  ): Promise<DecisionByCode[C]["answer"]> => {
    this.controller.signal.throwIfAborted();

    let pendingAnswer = this.cachedAnswers.get(question.code);

    if (!pendingAnswer) {
      pendingAnswer = this.queueQuestion<C>(question).catch((error) => {
        if (error instanceof CancelError) {
          console.warn(error);
        }
        if (error instanceof AppError) {
          this.log(error);
          this.pushLogs();
        }
        throw error;
      });
      this.cachedAnswers.set(question.code, pendingAnswer);
    }
    return pendingAnswer;
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
