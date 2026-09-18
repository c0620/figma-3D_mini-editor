export enum ErrorCode {
  ParsingError = "parsing-error",
  DecisionContextAborted = "decision-context-aborted",
}

export enum QuestionCode {
  UnknownTypeOfLight = "unknown-type-of-light",
}

export class AppError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class CancelError extends Error {
  readonly code: ErrorCode;
  constructor(message: string) {
    super(message);
    this.code = ErrorCode.DecisionContextAborted;
    this.name = new.target.name;
  }
}

export class DecisionRequiredError extends Error {
  readonly code: QuestionCode;

  constructor(code: QuestionCode, message: string) {
    super(message);
    this.code = code;
    this.name = new.target.name;
  }
}
