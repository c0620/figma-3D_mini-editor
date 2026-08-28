import type { FigmaVariableListItem } from "../../atoms/inputs/Selects";

const MOCK_MODE_ID = "1:0";

function hexToRgba(hex: string): RGBA {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
    a: 1,
  };
}

function colorVariable(
  id: string,
  name: string,
  color: RGBA
): FigmaVariableListItem {
  return {
    id,
    name,
    resolvedType: "COLOR",
    valuesByMode: {
      [MOCK_MODE_ID]: color,
    },
  };
}

const mockFigmaColorVariables: FigmaVariableListItem[] = [
  colorVariable("VariableID:accent", "common/accent", hexToRgba("#ff5900")),
  colorVariable(
    "VariableID:accent-light",
    "common/accent-light",
    hexToRgba("#ff9257")
  ),
  colorVariable(
    "VariableID:accent-dark",
    "common/accent-dark",
    hexToRgba("#a42100")
  ),
  colorVariable("VariableID:text", "common/text", hexToRgba("#ededed")),
  colorVariable("VariableID:white", "common/white", hexToRgba("#ffffff")),
  colorVariable("VariableID:black", "common/black", hexToRgba("#0c0b0c")),
  colorVariable(
    "VariableID:gizmo-x",
    "editor/gizmo-axis-x",
    hexToRgba("#ff0f0f")
  ),
  colorVariable(
    "VariableID:gizmo-y",
    "editor/gizmo-axis-y",
    hexToRgba("#00ff55")
  ),
  colorVariable(
    "VariableID:gizmo-z",
    "editor/gizmo-axis-z",
    hexToRgba("#0051ff")
  ),
  {
    id: "VariableID:roughness",
    name: "material/roughness-default",
    resolvedType: "FLOAT",
    valuesByMode: {
      [MOCK_MODE_ID]: 0.5,
    },
  },
];

/** Dev stand-in for Figma color variables until plugin bridge is wired. */
export function getMockFigmaVariables(): FigmaVariableListItem[] {
  return mockFigmaColorVariables;
}
