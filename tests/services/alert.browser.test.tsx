import {
  AppError,
  CancelError,
  ErrorCode,
  QuestionCode,
} from "@/services/alert/errors";
import { NotificationService } from "@/services/alert/notificationService";
import { OperationContext } from "@/services/alert/operationContext";
import { Success } from "@/services/alert/success";
import type {
  ImportTypes,
  PendingQuestion,
  StackedNotification,
} from "@/services/alert/types";
import {
  AddLightsWarning,
  UnknownNodeWarning,
  WarningCode,
} from "@/services/alert/warnings";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useSessionStore } from "@/store/sessionStore";
import { Alert, messageHeaders } from "@/ui/components/templates/alert/Alert";
import { DecisionRequiredError } from "@/services/alert/decisions";

describe("Alert", () => {
  let operationContext: OperationContext;
  let anotherOperationContext: OperationContext;
  const wLog1 = new AddLightsWarning("test wLog 1");
  const wLog2 = new AddLightsWarning("test wLog 2");
  const sLog = new Success("test sLog", "descr");
  const eLog = new AppError(ErrorCode.ParsingError, "test eLog");
  const q1 = new DecisionRequiredError(QuestionCode.UnknownQuestion, "test");
  const q12 = new DecisionRequiredError(QuestionCode.UnknownQuestion, "test");
  const q3 = new DecisionRequiredError(QuestionCode.UnknownTypeOfLight, "test");

  const q1Choices = DecisionRequiredError.questionChoices[q1.code];

  const titlesCombined = new Map();
  [wLog1, wLog2, sLog, eLog, q1].forEach((n) =>
    titlesCombined.set(n, messageHeaders[n.code])
  );
  const titlesDecisions = new Map<DecisionRequiredError, string>();
  [q1, q12, q3].forEach((q) => titlesDecisions.set(q, messageHeaders[q.code]));

  beforeEach(() => {
    const notificationService = new NotificationService();
    operationContext = new OperationContext(
      "test1" as ImportTypes,
      notificationService
    );
    anotherOperationContext = new OperationContext(
      "test2" as ImportTypes,
      notificationService
    );
    useSessionStore.setState(
      (s) => ({ ...s, decisions: [], notifications: [] }),
      true
    );
    operationContext.log(wLog1);
    operationContext.log(wLog2);
    operationContext.pushLogs();
  });

  test("decision has priority over notifications, but notifications stil displayed", async () => {
    operationContext.ask(q1);
    const screen = await render(<Alert />);

    let queue1: Promise<unknown>[] = [];
    titlesCombined.forEach((v, k) => {
      if (!(k instanceof DecisionRequiredError))
        queue1.push(
          expect.element(screen.getByText(v)).not.toBeInTheDocument()
        );
      else queue1.push(expect.element(screen.getByText(v)).toBeInTheDocument());
    });
    await Promise.all(queue1);

    const button = screen.getByRole("button", {
      name: q1Choices[0].text,
    });
    await button.click();

    await expect
      .element(screen.getByText(titlesCombined.get(q1)))
      .not.toBeInTheDocument();

    let queue2: Promise<unknown>[] = [];
    titlesCombined.forEach((v, k) => {
      if (!(k instanceof DecisionRequiredError))
        queue2.push(expect.element(screen.getByText(v)).toBeInTheDocument());
    });
    await Promise.any(queue2);
  });

  test.for(q1Choices)(
    "decision passes choices to alert and processes them ($text)",
    async (choice) => {
      useSessionStore.setState((s) => ({ ...s, decisions: [] }), true);

      const answerP = operationContext.ask(q1);
      const screen = await render(<Alert />);

      const button = screen.getByRole("button", {
        name: choice.text,
      });

      await expect.element(button).toBeVisible();
      await expect.element(button).toBeEnabled();

      await button.click();

      await expect(answerP).resolves.toMatchObject({
        answer: choice.value,
      });
    }
  );

  test("notification closes correctly & aborts and throws CancelError", async () => {
    useSessionStore.setState((s) => ({
      ...s,
      decisions: [],
      notifications: [],
    }));
    const answer = operationContext.ask(q1);
    const rejectsCancel = expect(answer).rejects.instanceOf(CancelError);

    const screen = await render(<Alert />);

    const alert = screen.container.querySelector('[class*="container"]');

    expect(alert).toBeVisible();

    const button = screen.getByTestId("closeButton");
    await button.click();

    await rejectsCancel;
    expect(alert).not.toBeVisible();
    expect(operationContext.isAborted()).toBe(true);
  });

  test("alert is closed when no notifications/decisions", async () => {
    useSessionStore.setState((s) => ({
      ...s,
      decisions: [],
      notifications: [],
    }));

    const screen = await render(<Alert />);

    const alert = screen.container.querySelector('[class*="container"]');

    expect(alert).not.toBeInTheDocument();
  });

  test("answers correspond decisions", async () => {
    useSessionStore.setState((s) => ({
      ...s,
      decisions: [],
      notifications: [],
    }));
    const answer1 = operationContext.ask(q1);
    const answer2 = operationContext.ask(q12);
    const answer3 = operationContext.ask(q3);

    const screen = await render(<Alert />);

    let askSameCode = true;

    for (const [k, v] of titlesDecisions) {
      if ((askSameCode && k.code == q1.code) || k.code != q1.code) {
        const title = screen.getByText(v);
        await expect.element(title).toBeVisible();

        const button = screen.getByRole("button", { name: k.choices[0].text });
        await button.click();

        askSameCode = false;
      }
    }

    await expect(answer1).resolves.toMatchObject({
      answer: q1.choices[0].value,
    });

    await expect(answer2).resolves.toMatchObject({
      answer: q12.choices[0].value,
    });

    await expect(answer3).resolves.toMatchObject({
      answer: q3.choices[0].value,
    });
  });
});
