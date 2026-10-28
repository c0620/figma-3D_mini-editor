export enum SuccessCode {
  RenderFinished = "render-finished",
  BaseSuccess = "base-success",
}

export interface BaseSuccess {
  name: string;
  description: string;
  code: SuccessCode;
  type: "success";
}

export class Success implements BaseSuccess {
  name: string;
  description: string;
  code = SuccessCode.BaseSuccess;
  readonly type = "success";

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
