import { describe, expect, it } from "vitest";

import { SceneNamingService } from "@/io/sceneNamingService";

describe("SceneNamingService", () => {
  const naming = new SceneNamingService();

  it("builds a texture frame name from scene and material", () => {
    expect(naming.buildFrameName("Room", "Wood")).toBe("Room__texture__Wood");
  });

  it("builds a render name from the scene name", () => {
    expect(naming.buildRenderName("Room")).toBe("Room__render");
  });
});
