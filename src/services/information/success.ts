export enum SuccessCode {
  RenderFinished = "render-finished",
  BaseSuccess = "base-success",
}

export interface BaseSuccess {
  name: string;
  description: string;
  code: SuccessCode;
}

export class Success implements BaseSuccess {
  name: string;
  description: string;
  code = SuccessCode.BaseSuccess;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
