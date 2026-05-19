import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

/** WebGL в тестовой среде недоступен — подменяем R3F/drei заглушками. */
vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "r3f-canvas", ...props },
      children,
    ),
}));

vi.mock("@react-three/drei", () => ({
  CameraControls: () => null,
  TransformControls: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Outlines: () => null,
  useTexture: () => ({}),
}));
