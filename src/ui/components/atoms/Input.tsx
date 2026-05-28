import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import type { InputField } from "../molecules/EditorInput";
import { useSessionStore } from "@/store/sessionStore";

const DECIMAL_DRAFT = /^-?(\d*\.?\d*|\.\d*)?$/;

function isCompleteNumber(text: string): boolean {
  if (text === "" || text === "-" || text === "." || text === "-.")
    return false;
  if (text.endsWith(".")) return false;
  return !Number.isNaN(Number(text));
}

export function InputVal({ field }: { field: InputField }) {
  const [draft, setDraft] = useState(() => String(field.value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(field.value));
  }, [field.value, focused]);

  const commit = (text: string) => {
    if (isCompleteNumber(text)) {
      field.onChange(Number(text));
      setDraft(String(Number(text)));
      return;
    }
    setDraft(String(field.value));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next !== "" && !DECIMAL_DRAFT.test(next)) return;

    setDraft(next);
    if (isCompleteNumber(next)) {
      field.onChange(Number(next));
    }
  };

  const handleBlur = () => {
    setFocused(false);
    commit(draft);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <>
      {field.label ? <label>{field.label}</label> : null}
      <input
        type="text"
        step="1"
        style={field.isActive ? { color: "orange" } : { color: "white" }}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        value={draft}
      />
    </>
  );
}

// export function InputMultipleText() {}

export function InputColor({
  color,
  onChange,
}: {
  color: string;
  onChange: (hex: string) => void;
}) {
  function decodeHEX(value: string, channel: "R" | "G" | "B"): number {
    switch (channel) {
      case "R":
        return parseInt(value.slice(1, 3), 16);
      case "G":
        return parseInt(value.slice(3, 5), 16);
      case "B":
        return parseInt(value.slice(5), 16);
    }
  }

  function codeHEX(value: number, channel: "R" | "G" | "B") {
    let hex = value.toString(16);
    hex = hex.length == 1 ? `0${hex}` : hex;
    switch (channel) {
      case "R":
        return "#" + hex + color.slice(3);
      case "G":
        return color.slice(0, 3) + hex + color.slice(5);
      case "B":
        return color.slice(0, 5) + hex;
    }
  }

  return (
    <>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
      <div>
        RGB:
        <input
          type="number"
          value={decodeHEX(color, "R")}
          min={0}
          onChange={(e) => onChange(codeHEX(+e.target.value, "R"))}
        />
        <input
          type="number"
          value={decodeHEX(color, "G")}
          onChange={(e) => onChange(codeHEX(+e.target.value, "G"))}
        />
        <input
          type="number"
          value={decodeHEX(color, "B")}
          onChange={(e) => onChange(codeHEX(+e.target.value, "B"))}
        />
      </div>
    </>
  );
}

export function InputProjectName() {
  const projectName = useSessionStore((s) => s.projectName);
  const setProjectName = useSessionStore((s) => s.setProjectName);
  const [draft, setDraft] = useState(projectName);

  useEffect(() => {
    setDraft(projectName);
  }, [projectName]);

  const commit = () => {
    setProjectName(draft);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      value={draft}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
}

export function InputModelSource() {}

export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

export function SelectIcon({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => onChange(option.id)}
          style={{
            backgroundColor: "black",
            opacity: value === option.id ? 1 : 0.55,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

export function SelectColor() {}

export function Slider() {
  return <div>slider</div>;
}

export function SliderCentered() {
  return <div>c slider</div>;
}

export function PreviewColor() {}

export { FileInput } from "../molecules/import/FileInput";
export { FigmaInput } from "../molecules/import/FigmaInput";
