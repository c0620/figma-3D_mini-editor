import { randomUUID } from "@/lib/randomId";
import { QuestionCode } from "./errors";
import type { DecisionByCode } from "./types";

type DecisionParamsByCode = {
  [C in QuestionCode]: DecisionByCode[C]["question"]["choices"];
};

export class DecisionRequiredError<
  C extends QuestionCode = QuestionCode,
> extends Error {
  static questionChoices: DecisionParamsByCode = {
    [QuestionCode.UnknownQuestion]: [
      {
        text: "testQuestion1",
        value: "test1",
      },
      {
        text: "testQuestion2",
        value: "test2",
      },
      {
        text: "testQuestion3",
        value: "test3",
      },
    ],
    [QuestionCode.UnknownTypeOfLight]: [
      { text: "Заменить на похожий источник света", value: true },
      { text: "Оставить только как группу", value: false },
    ],
  };

  readonly id: string;
  readonly code: C;
  readonly type = "error";
  readonly choices: DecisionByCode[C]["question"]["choices"];

  constructor(code: C, message: string, id?: string) {
    super(message);
    this.id = id ?? randomUUID();
    this.code = code;
    this.name = new.target.name;
    this.choices = DecisionRequiredError.questionChoices[code];
  }
}
