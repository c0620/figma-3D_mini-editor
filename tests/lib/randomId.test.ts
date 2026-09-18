import { afterEach, describe, expect, it, vi } from "vitest";

import { randomUUID } from "@/lib/randomId";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("randomUUID", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses crypto.randomUUID when it exists", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(id);

    expect(randomUUID()).toBe(id);
  });

  it("falls back to a UUID v4 string when randomUUID is missing", () => {
    vi.stubGlobal("crypto", {});

    expect(randomUUID()).toMatch(UUID_V4);
  });
});
