import {
  AppError,
  CancelError,
  DecisionRequiredError,
  ErrorCode,
  QuestionCode,
} from "@/services/information/errors";
import { NotificationService } from "@/services/information/notificationService";
import { OperationContext } from "@/services/information/operationContext";
import { Success } from "@/services/information/success";
import type {
  ImportTypes,
  Notification,
  StackedNotification,
} from "@/services/information/types";
import { UnknownNodeWarning, Warning } from "@/services/information/warnings";
import { useSessionStore } from "@/store/sessionStore";
import { beforeEach, describe, expect, test, vi } from "vitest";

const session = vi.hoisted(() => ({
  decisions: [] as any[],
  pushDecision: vi.fn((d) => session.decisions.push(d)),
  notifications: [] as StackedNotification[],
  pushNotification: vi.fn((n: StackedNotification) => {
    session.notifications.push(n);
  }),
  removeNotification: vi.fn((id: string) => {
    const index = session.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      session.notifications.splice(index, 1);
    }
  }),
}));

vi.mock("@/store/sessionStore", () => ({
  useSessionStore: {
    getState: vi.fn(() => ({
      decisions: session.decisions,
      pushDecision: session.pushDecision,
      notifications: session.notifications,
      pushNotification: session.pushNotification,
      removeNotification: session.removeNotification,
    })),
    setState: vi.fn((patch: Record<keyof typeof session, unknown>) => {
      Object.assign(session, patch);
    }),
  },
}));

describe("operationContext", () => {
  let notificationService = new NotificationService();
  let operationContext = new OperationContext(
    "test" as ImportTypes,
    notificationService,
  );

  beforeEach(() => {
    vi.clearAllMocks();

    notificationService = new NotificationService();
    vi.spyOn(notificationService, "push");
    vi.spyOn(notificationService, "pushStacked");
    vi.spyOn(notificationService, "toStackedNotification");
    vi.spyOn(notificationService, "removeByContext");
    session.decisions = [];
    session.notifications = [];
    operationContext = new OperationContext(
      "test" as ImportTypes,
      notificationService,
    );
  });

  const eLog1 = {
    id: "test01",
    contextId: operationContext.id,
    createdAt: 0,
    type: "error" as const,
    code: ErrorCode.ParsingError,
  };
  const eLog2 = {
    id: "test02",
    contextId: operationContext.id,
    createdAt: 0,
    type: "error" as const,
    code: ErrorCode.ParsingError,
  };
  const wLog1 = new Warning("wLog1", "test1");
  const wLog2 = new Warning("wLog2", "test2");
  const wLog3 = new UnknownNodeWarning("wLog3", "test3");
  const sLog1 = new Success("sLog1", "test4");
  const eLog3 = new AppError(ErrorCode.ParsingError, "test5");

  test("add new log to inner logs array", () => {
    operationContext.log(eLog1);
    expect(operationContext["logs"]).toContain(eLog1);
    operationContext.log(eLog2);
    expect(operationContext["logs"]).toContain(eLog2);
    expect(operationContext["logs"].length).toBe(2);
    console.log("Inner logs:", operationContext["logs"]);
  });

  test("accept all types of logs", () => {
    operationContext.log(eLog1);
    operationContext.log(wLog1);
    operationContext.log(sLog1);
    operationContext.log(eLog3);
    expect(operationContext["logs"]).toEqual([eLog1, wLog1, sLog1, eLog3]);
  });

  test("pushLogs should call notificationService.pushStacked with stacked notifications", () => {
    operationContext.log(wLog1);
    operationContext.log(wLog2);
    operationContext.log(wLog3);
    operationContext.pushLogs();
    expect(notificationService.toStackedNotification).toHaveBeenCalledTimes(2);
    expect(notificationService.pushStacked).toHaveBeenCalled();
    const pushed = session.notifications;
    console.log("Pushed notifications:", pushed);
    expect(pushed.length).toBe(2);
    expect(pushed[0].count).toBe(2);
    expect(pushed[1].count).toBe(1);
    expect(pushed[0].code).toBe(wLog1.code);
    expect(pushed[0].code).toBe(wLog2.code);
    expect(pushed[1].code).toBe(wLog3.code);
    expect(pushed[0].content).toEqual([
      { source: wLog1.source, nodeType: wLog1.nodeType },
      { source: wLog2.source, nodeType: wLog2.nodeType },
    ]);
    expect(pushed[1].content).toEqual([
      { source: wLog3.source, nodeType: wLog3.nodeType },
    ]);
  });

  test("ignore logs if context is aborted", () => {
    operationContext.abort();
    operationContext.log(eLog1);
    expect(operationContext["logs"]).not.toContain(eLog1);
  });

  test("isAborted returns true after abort", () => {
    expect(operationContext.isAborted()).toBe(false);
    operationContext.abort();
    expect(operationContext.isAborted()).toBe(true);
  });

  test("abort cancels only decisions of this context", async () => {
    const spyQueueQuestion = vi.spyOn(operationContext, "queueQuestion");
    const decisions = [
      {
        id: "1",
        error: new DecisionRequiredError(
          QuestionCode.UnknownTypeOfLight,
          "test",
        ),
      },
      {
        id: "2",
        error: new DecisionRequiredError(
          QuestionCode.UnknownTypeOfLight,
          "test",
        ),
      },
    ];

    session.pushDecision(decisions[1]);

    const answer = operationContext.ask(decisions[0]);

    expect(
      spyQueueQuestion,
      "check assigning of context ID",
    ).toHaveBeenCalledWith({
      ...decisions[0],
      contextId: operationContext.id,
    });

    operationContext.abort();

    await expect(answer).rejects.toThrow(CancelError);

    expect(notificationService.removeByContext).toHaveBeenCalledWith(
      operationContext.id,
    );

    expect(operationContext.isAborted()).toBe(true);

    expect(session.decisions).toEqual([decisions[1]]);
  });
});
