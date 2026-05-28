import { AspectCenteredSlider, InputVal, Slider, SliderCentered } from "../atoms/Input";
import { isPanelOpen, type PanelMode } from "../organisms/PanelScene";
import {
  aspectToRatioPair,
  ratioPairToAspect,
} from "@/camera/aspectRatio";
import { useMemo } from "react";
import styles from "./EditorInput.module.css";

export type InputField = {
  onChange: (value: number) => void;
  value: number;
  isActive: boolean;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function ObjectNumberInput({
  mode,
  fields,
  label,
  sliderType,
  sliderLayout = "inline",
  inputWidth = "default",
  highlight = false,
}: {
  mode: PanelMode;
  fields: Array<InputField>;
  label: string;
  sliderType: "default" | "centered" | null;
  sliderLayout?: "below" | "inline";
  inputWidth?: "default" | "compact";
  highlight?: boolean;
}) {
  const isOpen = isPanelOpen(mode);
  const isCompact = !isOpen;

  const labelClass = highlight
    ? `${styles.label} ${styles.labelActive}`
    : styles.label;

  const singleField = fields.length === 1 ? fields[0] : null;

  if (isCompact) {
    return (
      <div className={styles.groupCompact}>
        {fields.map((field, i) => (
          <div key={field.label ?? i} className={styles.compactField}>
            <InputVal field={field} />
          </div>
        ))}
      </div>
    );
  }

  const inline =
    sliderLayout === "inline" && singleField != null && sliderType != null;

  const slider =
    sliderType === "default" && singleField ? (
      <Slider field={singleField} inline={inline} />
    ) : sliderType === "centered" && singleField ? (
      <SliderCentered field={singleField} inline={inline} />
    ) : null;

  const inputClass =
    inputWidth === "compact"
      ? `${styles.controlInput} ${styles.controlInputCompact}`
      : styles.controlInput;

  if (inline) {
    return (
      <div className={styles.group}>
        <p className={labelClass}>{label}</p>
        <div className={styles.controlRow}>
          <div className={inputClass}>
            <InputVal field={singleField!} />
          </div>
          <div className={styles.controlSlider}>{slider}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <p className={labelClass}>{label}</p>
      <div className={styles.axisRow}>
        {fields.map((field, i) => (
          <div key={field.label ?? i} className={styles.axisField}>
            {field.label ? (
              <span className={styles.axisLabel}>{field.label}</span>
            ) : null}
            <InputVal field={field} />
          </div>
        ))}
      </div>
      {slider}
    </div>
  );
}

export function ObjectRatioInput({
  mode,
  label,
  value,
  onChange,
}: {
  mode: PanelMode;
  label: string;
  value: number;
  onChange: (aspect: number) => void;
}) {
  const isOpen = isPanelOpen(mode);
  const [width, height] = useMemo(() => aspectToRatioPair(value), [value]);

  if (!isOpen) {
    return (
      <div className={styles.groupCompact}>
        <div className={styles.ratioFieldsCompact}>
          <div className={styles.compactField}>
            <InputVal
              field={{
                value: width,
                isActive: false,
                onChange: (nextWidth) =>
                  onChange(ratioPairToAspect(nextWidth, height)),
              }}
            />
          </div>
          <span className={styles.ratioSeparator} aria-hidden>
            |
          </span>
          <div className={styles.compactField}>
            <InputVal
              field={{
                value: height,
                isActive: false,
                onChange: (nextHeight) =>
                  onChange(ratioPairToAspect(width, nextHeight)),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <p className={styles.label}>{label}</p>
      <div className={styles.controlRow}>
        <div className={styles.ratioFields}>
          <div className={styles.ratioField}>
            <InputVal
              field={{
                value: width,
                isActive: false,
                onChange: (nextWidth) =>
                  onChange(ratioPairToAspect(nextWidth, height)),
              }}
            />
          </div>
          <span className={styles.ratioSeparator} aria-hidden>
            |
          </span>
          <div className={styles.ratioField}>
            <InputVal
              field={{
                value: height,
                isActive: false,
                onChange: (nextHeight) =>
                  onChange(ratioPairToAspect(width, nextHeight)),
              }}
            />
          </div>
        </div>
        <div className={styles.controlSlider}>
          <AspectCenteredSlider aspect={value} onChange={onChange} inline />
        </div>
      </div>
    </div>
  );
}

export function ObjectColorInput() {
  return <div>Object Color Input</div>;
}

export function MeshMaterialSelect() {}

export function TextureSelect() {}

export function Options() {}

export function ModeSelect() {}
