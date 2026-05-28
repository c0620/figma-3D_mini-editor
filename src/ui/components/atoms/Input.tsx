import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import type { InputField } from "../molecules/EditorInput";
import { useI18n } from "@/app/ApplicationKernelContext";
import { useSessionStore } from "@/store/sessionStore";
import {
  aspectToCenteredSlider,
  ASPECT_CENTERED_SLIDER_MAX,
  ASPECT_CENTERED_SLIDER_MIN,
  centeredSliderToAspect,
} from "@/camera/aspectRatio";
import styles from "./Input.module.css";

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

  const inputClass = field.isActive
    ? `${styles.valInput} ${styles.valInputActive}`
    : styles.valInput;

  return (
    <input
      type="text"
      step="1"
      className={inputClass}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      value={draft}
    />
  );
}

// export function InputMultipleText() {}

function decodeHexRgb(hex: string): [number, number, number] {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  if (normalized.length < 6) return [0, 0, 0];
  return [
    parseInt(normalized.slice(0, 2), 16) || 0,
    parseInt(normalized.slice(2, 4), 16) || 0,
    parseInt(normalized.slice(4, 6), 16) || 0,
  ];
}

export function InputColor({
  color,
  onChange,
  layout = "panel",
}: {
  color: string;
  onChange: (hex: string) => void;
  layout?: "panel" | "compact";
}) {
  const { t } = useI18n();
  const [r, g, b] = decodeHexRgb(color);

  const handleChange = (hex: string) => {
    onChange(hex);
  };

  if (layout === "compact") {
    return (
      <div className={styles.colorRow}>
        <input
          type="color"
          className={`${styles.colorSwatch} ${styles.colorSwatchRound}`}
          value={color}
          onChange={(e) => handleChange(e.target.value)}
        />
        <input
          type="text"
          className={`${styles.valInput} ${styles.colorHex}`}
          value={color}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className={styles.colorBlock}>
      <p className={styles.colorLabel}>{t("material.baseColor")}</p>
      <div className={styles.colorRow}>
        <input
          type="color"
          className={`${styles.colorSwatch} ${styles.colorSwatchRound}`}
          value={color}
          onChange={(e) => handleChange(e.target.value)}
        />
        <input
          type="text"
          className={`${styles.valInput} ${styles.colorHex}`}
          value={color}
          onChange={(e) => handleChange(e.target.value)}
        />
        <span className={styles.colorRgbText}>
          {t("material.baseColor.rgb")}: {r} {g} {b}
        </span>
      </div>
    </div>
  );
}

export function InputProjectName({
  className,
  toolbar = false,
}: {
  className?: string;
  toolbar?: boolean;
}) {
  const { t } = useI18n();
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

  const inputClass = [
    styles.projectName,
    toolbar ? styles.projectNameToolbar : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      className={inputClass}
      placeholder={t("input.projectName.placeholder")}
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
    <label
      className={
        disabled ? `${styles.toggle} ${styles.toggleDisabled}` : styles.toggle
      }
    >
      <input
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.toggleTrack} aria-hidden />
    </label>
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

function resolveSliderBounds(field: InputField) {
  const step = field.step ?? 0.01;
  let min = field.min ?? 0;
  let max = field.max ?? 1;
  if (field.value < min) min = field.value;
  if (field.value > max) max = field.value;
  if (min === max) max = min + step;
  return { min, max, step };
}

function RangeSlider({
  field,
  centered = false,
  inline = false,
}: {
  field: InputField;
  centered?: boolean;
  inline?: boolean;
}) {
  const { min, max, step } = resolveSliderBounds(field);
  const trackClass = [
    centered ? styles.sliderTrackCentered : styles.sliderTrack,
    inline ? styles.sliderTrackInline : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={trackClass}>
      <input
        type="range"
        className={styles.sliderInput}
        min={min}
        max={max}
        step={step}
        value={field.value}
        onChange={(e) => field.onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Slider({
  field,
  inline = false,
}: {
  field: InputField;
  inline?: boolean;
}) {
  return <RangeSlider field={field} inline={inline} />;
}

export function SliderCentered({
  field,
  inline = false,
}: {
  field: InputField;
  inline?: boolean;
}) {
  return <RangeSlider field={field} centered inline={inline} />;
}

export function AspectCenteredSlider({
  aspect,
  onChange,
  inline = true,
}: {
  aspect: number;
  onChange: (aspect: number) => void;
  inline?: boolean;
}) {
  const position = aspectToCenteredSlider(aspect);
  const trackClass = [
    styles.sliderTrackCentered,
    inline ? styles.sliderTrackInline : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={trackClass}>
      <input
        type="range"
        className={styles.sliderInput}
        min={ASPECT_CENTERED_SLIDER_MIN}
        max={ASPECT_CENTERED_SLIDER_MAX}
        step={0.01}
        value={position}
        onChange={(e) =>
          onChange(centeredSliderToAspect(Number(e.target.value)))
        }
      />
    </div>
  );
}

export function PreviewColor() {}

export { FileInput } from "../molecules/import/FileInput";
export { FigmaInput } from "../molecules/import/FigmaInput";
