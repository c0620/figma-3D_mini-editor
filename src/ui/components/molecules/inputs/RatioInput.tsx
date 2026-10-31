import { SliderCentered } from "../../atoms/inputs/Sliders";
import {
  InputPairNumbers,
  type InputNumbersField,
  type InputPairNumbersField,
  type InputPairValues,
} from "../../atoms/inputs/TextInputs";
import styles from "./Common.module.scss";
import { useState, type SetStateAction } from "react";

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function aspectToPair(aspect: number, maxDen = 64): [number, number] {
  let bestN = 1,
    bestD = 1,
    bestErr = Infinity;

  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(aspect * d);
    const err = Math.abs(aspect - n / d);
    if (err < bestErr) {
      bestErr = err;
      bestN = n;
      bestD = d;
    }
  }

  const g = gcd(bestN, bestD);
  return [bestN / g, bestD / g];
}

function findRatio(sliderVal: number): [number, number] {
  const ratio = 1.3 * sliderVal * sliderVal + 1;
  const aspect = aspectToPair(ratio, 10);
  if (sliderVal < 0) return [aspect[1], aspect[0]];
  return aspect;
}

function pairToSlider(w: number, h: number): number {
  const landscape = w >= h;
  const aspect = Math.max(w, h) / Math.min(w, h);
  const t = Math.sqrt(Math.max(0, (aspect - 1) / 1.3));
  return landscape ? t : -t;
}

export function RatioInput({
  title,
  field,
  isOpen = true,
}: {
  title?: string;
  field: Omit<InputPairNumbersField, "setValues">;
  isOpen?: boolean;
}) {
  const [values, setValues] = useState<[string, string]>([
    field.value1,
    field.value2,
  ]);

  const sliderField: InputNumbersField = {
    onApply: (value: number) => {
      const [v1, v2] = findRatio(value);
      field.onApply(v1, v2);
      setValues([v1 + "", v2 + ""]);
    },
    value: pairToSlider(+field.value1, +field.value2) + "",
    setValue: (value) => {
      field.onApply(
        ...findRatio(
          parseFloat(
            typeof value == "function"
              ? value(pairToSlider(+field.value1, +field.value2) + "")
              : value
          )
        )
      );
    },
    isActive: false,
    range: {
      min: -1,
      max: 1,
      step: 0.01,
      variant: "centered",
    },
  };

  const inputField: InputPairNumbersField = {
    ...field,
    value1: values[0],
    value2: values[1],
    setValues: (values) => {
      setValues(values);
    },
    onApply: (...vals: InputPairValues) => {
      const v1 = vals[0] === undefined ? +field.value1 : vals[0];
      const v2 = vals[1] === undefined ? +field.value2 : vals[1];
      let result: [number, number];
      if (v1 !== 0 && v2 !== 0) result = [v1, v2];
      else if (v1 === 0 && v2 === 0) {
        result = [+field.value1, +field.value2];
      } else if (v1 === 0) {
        result = [+field.value1, v2];
      } else {
        result = [v1, +field.value2];
      }
      field.onApply(...result);
    },
    beforeApply: (...vals) => {
      const v1 = vals[0] === undefined ? +field.value1 : vals[0];
      const v2 = vals[1] === undefined ? +field.value2 : vals[1];
      if (v1 === 0 && v2 === 0) {
        return [+field.value1, +field.value2];
      } else if (v1 === 0) {
        return [+field.value1, v2];
      } else if (v2 === 0) return [v1, +field.value2];
      return [...vals];
    },
  };

  return (
    <div className={styles.commonContainer}>
      {isOpen && <p className="t3">{title}</p>}
      <div className={styles.commonInputRow}>
        <InputPairNumbers field={inputField} vertical={!isOpen} />
        {isOpen && <SliderCentered field={sliderField} />}
      </div>
    </div>
  );
}
