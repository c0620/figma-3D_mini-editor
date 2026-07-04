import type { Material } from "@/types/scene";
import { useState } from "react";

import styles from "./Selects.module.scss";
import { Color } from "three";

function variableColorToCss(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || !("r" in value)) {
    return undefined;
  }

  const { r, g, b } = value as RGB;
  const a = "a" in value ? (value as RGBA).a : 1;

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

export type FigmaVariableListItem = {
  id: string;
  name: string;
  resolvedType: VariableResolvedDataType;
  valuesByMode: Record<string, VariableValue>;
};

export function SelectIcon() {
  return (
    <div>
      <img alt="material" />
    </div>
  );
}

export function SelectColor({
  variables,
  value,
  onChange,
}: {
  value: Material["color"];
  onChange: (value: Material["color"]) => void;
  variables: FigmaVariableListItem[] | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.selectContainer + " t3"}>
      {!open ? (
        <button className={styles.selectTrigger} onClick={() => setOpen(true)}>
          {value.type == "figma" ? (
            <>
              <div
                className={styles.colorPreview}
                style={{
                  backgroundColor: value.value.getStyle(),
                }}
              />
              {value.name}
            </>
          ) : (
            "Выберите переменную Figma"
          )}
        </button>
      ) : (
        <ul
          className={styles.selectDropdown}
          onPointerLeave={() => setOpen(false)}
        >
          {variables?.map((variable) => {
            if (variable.resolvedType !== "COLOR") return null;

            const rawColor = Object.values(variable.valuesByMode)[0];
            const backgroundColor = variableColorToCss(rawColor);
            if (!backgroundColor) return null;

            return (
              <li
                key={variable.id}
                className={styles.selectItem}
                onClick={() => {
                  onChange({
                    type: "figma",
                    value: new Color(variableColorToCss(rawColor)),
                    id: variable.id,
                    name: variable.name,
                  });
                  setOpen(false);
                }}
              >
                <div
                  className={styles.colorPreview}
                  style={{
                    backgroundColor,
                    border:
                      value.type == "figma" && value.id == variable.id
                        ? "1px solid orange"
                        : "none",
                  }}
                />
                {variable.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ModeSelect() {}
export function MeshMaterialSelect() {}

export function Options() {}
