import type { DecisionRequiredError } from "./decisions";
import type { AppError, ErrorCode, QuestionCode } from "./errors";
import type { SuccessCode } from "./success";
import type { WarningCode } from "./warnings";

export enum ImportTypes {
  device = "deviceI",
  figma = "figmaI",
  library = "libraryI",
}

export enum ExportTypes {
  device = "deviceE",
  figma = "figmaE",
}

export type OperationType = ImportTypes | ExportTypes;

type NotificationBase = {
  id: string;
  contextId: string;
  createdAt: number;
};

export type ErrorNotification = NotificationBase & {
  type: "error";
  code: ErrorCode;
};

export type WarningNotification = NotificationBase & {
  type: "warning";
  code: WarningCode;
  source: string;
  nodeType?: string;
};

export type SuccessNotification = NotificationBase & {
  type: "success";
  code: SuccessCode;
};

export type Notification =
  ErrorNotification | WarningNotification | SuccessNotification;

export type StackedNotification = Omit<Notification, "source" | "nodeType"> & {
  count: number;
  content?: Pick<WarningNotification, "source" | "nodeType">[];
};

type QuestionChoices<T> = {
  text: string; //toDo: i18n
  value: T;
};

type DecisionQuestion<T> = {
  id: string;
  contextId: string;
  error: DecisionRequiredError;
  choices: QuestionChoices<T>[];
  text?: string; //toDo: i18n
};

type DecisionAnswer<T> = Omit<DecisionQuestion<T>, "choices"> & {
  answer: T;
};

type DecisionCompose<T> = {
  question: DecisionQuestion<T>;
  answer: DecisionAnswer<T>;
};

export type DecisionByCode = {
  [QuestionCode.UnknownQuestion]: DecisionCompose<string>;
  [QuestionCode.UnknownTypeOfLight]: DecisionCompose<boolean>;
};

export type PendingQuestionByCode = {
  [C in QuestionCode]: DecisionByCode[C]["question"] & {
    resolve: (value: DecisionByCode[C]["answer"]) => void;
    reject: (abort?: boolean) => void;
  };
};

export type PendingQuestion<C extends QuestionCode = QuestionCode> =
  PendingQuestionByCode[C];
