import type { AppError, DecisionRequiredError, ErrorCode } from "./errors";
import type { SuccessCode } from "./success";
import type { WarningCode } from "./warnings";

export enum ImportTypes {
  device = "device",
  figma = "figma",
  library = "library",
}

export type OperationType = ImportTypes;

export type DecisionQuestion = {
  id: string;
  contextId: string;
  error: DecisionRequiredError;
  choice?: boolean;
  params?: object;
};

export type DecisionAnswer = {
  questionId: string;
  choice: boolean;
};

export type PendingQuestion = DecisionQuestion & {
  resolve: (value: DecisionQuestion) => void;
  reject: (abort?: boolean) => void;
};

type NotificationBase = {
  id: string;
  contextId: string;
  createdAt: number;
};

export type ErrorNotification = NotificationBase & {
  type: "error";
  code: ErrorCode;
  params?: Record<string, string>;
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
