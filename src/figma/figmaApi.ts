import type {
  FigmaAPIAnswers,
  FigmaAPITypes,
  UIRequests,
} from "plugin-src/types";

type Pending = {
  resolve: (value: any) => void;
  reject: (reason?: unknown) => void;
};

export class FigmaAPI {
  messages = new Map<string, Pending>();

  constructor() {
    this.listenMessages();
  }

  postMessage<R extends UIRequests[FigmaAPITypes]>(
    message: R
  ): Promise<FigmaAPIAnswers[R["type"]]> {
    return new Promise((resolve, reject) => {
      this.messages.set(message.id, { resolve, reject });
      parent.postMessage({ pluginMessage: message }, "*");
    });
  }

  private listenMessages() {
    window.addEventListener("message", (event) => {
      const answer = event.data.pluginMessage as FigmaAPIAnswers[FigmaAPITypes];
      if (!answer) return;

      const pending = this.messages.get(answer.id);

      if (!pending) throw new Error("No pending promise for figma API");

      this.messages.delete(answer.id);
      pending.resolve(answer);
    });
  }
}
