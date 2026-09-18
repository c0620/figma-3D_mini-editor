import { beforeEach, describe, expect, it } from "vitest";

import { ErrorCode } from "@/services/information/errors";
import { useSessionStore } from "@/store/sessionStore";
import type { Notification } from "@/services/information/types";

import { resetStores } from "../helpers/resetStores";
import { TEST_IDS } from "../helpers/sceneFixtures";

const notification: Notification = {
  id: "n-1",
  contextId: "ctx-1",
  createdAt: 1,
  type: "error",
  code: ErrorCode.ParsingError,
};

describe("useSessionStore (session contract)", () => {
  beforeEach(() => {
    resetStores();
  });

  it("stores history flags", () => {
    useSessionStore.getState().setHistoryFlags(true, true);
    expect(useSessionStore.getState().canUndo).toBe(true);
    expect(useSessionStore.getState().canRedo).toBe(true);
  });

  it("stores the active object and tool", () => {
    useSessionStore
      .getState()
      .setActiveObjectRef({ id: TEST_IDS.mesh, kind: "Mesh" });
    useSessionStore.getState().setActiveObjectTool("translate");

    expect(useSessionStore.getState().activeObjectRef).toEqual({
      id: TEST_IDS.mesh,
      kind: "Mesh",
    });
    expect(useSessionStore.getState().activeObjectTool).toBe("translate");
  });

  it("appends and removes notifications", () => {
    useSessionStore.getState().pushNotification(notification);
    expect(useSessionStore.getState().notifications).toEqual([notification]);

    useSessionStore.getState().removeNotification("n-1");
    expect(useSessionStore.getState().notifications).toEqual([]);
  });
});
