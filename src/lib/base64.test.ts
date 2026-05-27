import { describe, expect, it } from "vitest";

import {
  arrayBufferToBase64,
  base64ToUint8Array,
} from "./base64";

describe("base64", () => {
  it("round-trips ArrayBuffer through base64", () => {
    const source = new Uint8Array([0, 1, 2, 255, 128, 64]);
    const encoded = arrayBufferToBase64(source.buffer);
    const decoded = base64ToUint8Array(encoded);

    expect(Array.from(decoded)).toEqual(Array.from(source));
  });

  it("encodes glTF magic header", () => {
    const header = new TextEncoder().encode("glTF");
    const encoded = arrayBufferToBase64(header.buffer);
    expect(encoded).toBe("Z2xURg==");
  });
});
