import { randomUUID } from "../lib/randomId";
import type { FigmaPluginResponse } from "./figmaMessages";

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const EXPORT_RENDER_FRAME_TIMEOUT_MS = 120_000;

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function isFigmaPlugin(): boolean {
  return typeof parent !== "undefined" && parent !== window;
}

export class FigmaAPI {
  colors: object = {};
  private pending = new Map<string, PendingRequest>();
  private listenerAttached = false;

  constructor() {
    this.attachListener();
  }

  postMessage(message: object): void {
    parent.postMessage({ pluginMessage: message }, "*");
  }

  request<T>(
    message: Record<string, unknown>,
    options?: { timeoutMs?: number }
  ): Promise<T> {
    this.attachListener();

    const requestId = randomUUID();
    const timeoutMs = options?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error("Figma plugin request timed out"));
      }, timeoutMs);

      this.pending.set(requestId, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });

      this.postMessage({ ...message, requestId });
    });
  }

  private attachListener(): void {
    if (this.listenerAttached || typeof window === "undefined") return;
    this.listenerAttached = true;

    window.addEventListener("message", (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as FigmaPluginResponse | undefined;
      if (!msg || msg.type !== "figma-response" || !msg.requestId) return;

      const pending = this.pending.get(msg.requestId);
      if (!pending) return;

      clearTimeout(pending.timer);
      this.pending.delete(msg.requestId);

      if (msg.ok) {
        pending.resolve(msg.payload);
        return;
      }

      pending.reject(new Error(msg.error ?? "Figma plugin request failed"));
    });
  }
}
