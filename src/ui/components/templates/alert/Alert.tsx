import { ErrorCode, QuestionCode } from "@/services/alert/errors";
import type {
  DecisionByCode,
  PendingQuestion,
  StackedNotification,
} from "@/services/alert/types";
import { useSessionStore } from "@/store/sessionStore";
import styles from "./Alert.module.scss";
import CloseIcon from "@images/icons/descriptive/closeX.svg?react";
import {
  OptionButton,
  SmallButton,
} from "@/ui/components/atoms/buttons/Button";
import { WarningCode } from "@/services/alert/warnings";
import { SuccessCode } from "@/services/alert/success";

type UserHeaders = Record<QuestionCode, string> &
  Record<ErrorCode, string> &
  Record<WarningCode, string> &
  Record<SuccessCode, string> &
  Record<QuestionCode, string>;

export const messageHeaders: UserHeaders = {
  [ErrorCode.DecisionContextAborted]: "Задача отменена",
  [ErrorCode.ParsingError]: "Ошибка парсинга",
  [ErrorCode.NoScene]: "Нет сцены",
  [ErrorCode.UnknownError]: "Неизвестная ошибка",
  [ErrorCode.UnsupportedExportFormat]: "Формат экспорта не поддерживается",
  [ErrorCode.UnsupportedImportFormat]: "Формат импорта не поддерживается",
  [QuestionCode.UnknownTypeOfLight]: "Неизвестный тип света",
  [QuestionCode.UnknownQuestion]: "Неизвестное решение",
  [WarningCode.PluginCamera]: "Автоматически добавлена камера",
  [WarningCode.PluginLights]: "Автоматически добавлено освещение",
  [WarningCode.SkeletonNotSupported]: "Анимация не поддерживается",
  [WarningCode.UnknownNode]: "Неизвестный узел",
  [WarningCode.UnknownWarning]: "Предупреждение",
  [SuccessCode.BaseSuccess]: "Успех",
  [SuccessCode.RenderFinished]: "Рендер закончен",
};

function NotifyModal({
  notification,
  headers,
}: {
  notification: StackedNotification;
  headers: UserHeaders;
}) {
  const removeNotification = useSessionStore((s) => s.removeNotification);

  return (
    <>
      <div>
        <h1>
          {Object.hasOwn(headers, notification.code)
            ? headers[notification.code]
            : notification.code}
        </h1>
        <p style={{ whiteSpace: "pre-wrap" }}>{notification.createdAt}</p>
      </div>

      <button
        className={styles.close}
        type="button"
        onClick={() => {
          removeNotification(notification.id);
        }}
      >
        <CloseIcon />
      </button>
    </>
  );
}

function QuestionModal({
  question,
  headers,
}: {
  question: PendingQuestion;
  headers: UserHeaders;
}) {
  const removeQuestion = useSessionStore((s) => s.removeDecision);

  const answerQuestion = <C extends QuestionCode>(
    question: PendingQuestion<C>,
    value: DecisionByCode[C]["answer"]["answer"]
  ) => {
    const answer = {
      id: question.id,
      contextId: question.contextId,
      error: question.error,
      text: question.text,
      answer: value,
    } as DecisionByCode[C]["answer"];

    question.resolve(answer);
    removeQuestion(question.id);
  };

  return (
    <>
      <div>
        <h1>
          {Object.hasOwn(headers, question.error.code)
            ? headers[question.error.code]
            : question.error.name}
        </h1>
        <p>{question.error.message}</p>
        <div className={styles.buttons}>
          {question.choices.map((choice) => (
            <OptionButton
              key={choice.text}
              text={choice.text}
              onClick={() => answerQuestion(question, choice.value)}
            ></OptionButton>
          ))}
        </div>
      </div>
      <button
        className={styles.close}
        type="button"
        onClick={() => {
          question.reject();
        }}
        data-testid={"closeButton"}
      >
        <CloseIcon />
      </button>
    </>
  );
}

export function Alert() {
  const decisions = useSessionStore((s) => s.decisions);
  const notifications = useSessionStore((s) => s.notifications);

  const currentQuestion = decisions[0];
  const currentNotification = notifications[0];
  if (!currentNotification && !currentQuestion) return;

  return (
    <div className={styles.container}>
      {(currentQuestion && (
        <QuestionModal question={currentQuestion} headers={messageHeaders} />
      )) ||
        (currentNotification && (
          <NotifyModal
            notification={currentNotification}
            headers={messageHeaders}
          />
        ))}
    </div>
  );
}
