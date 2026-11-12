export enum ErrorCode {
  NoScene = "no-scene",
  UnknownError = "unknown-error",
  ParsingError = "parsing-error",
  DecisionContextAborted = "decision-context-aborted",
  UnsupportedExportFormat = "unsupported-export-format",
  UnsupportedImportFormat = "unsupported-import-format",
  UnknownFigmaExportError = "unknown-figma-export-error",
}

export enum QuestionCode {
  UnknownTypeOfLight = "unknown-type-of-light",
  UnknownQuestion = "unknown-question",
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly type = "error";
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class CancelError extends Error {
  readonly code: ErrorCode;
  readonly type = "error";
  constructor(message: string) {
    super(message);
    this.code = ErrorCode.DecisionContextAborted;
    this.name = new.target.name;
  }
}
