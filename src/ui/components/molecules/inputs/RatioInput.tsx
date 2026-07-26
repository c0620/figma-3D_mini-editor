import { SliderCentered } from "../../atoms/inputs/Sliders";
import {
  InputPairNumbers,
  type InputPairNumbersField,
} from "../../atoms/inputs/TextInputs";
import styles from "./Common.module.scss";

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
}: {
  title?: string;
  field: InputPairNumbersField;
}) {
  return (
    <div className={styles.commonContainer}>
      <p className="t3">{title}</p>
      <div className={styles.commonInputRow}>
        <InputPairNumbers field={field} />
        <SliderCentered
          value={pairToSlider(field.value1, field.value2)}
          min={-1}
          max={1}
          step={0.01}
          onChange={(value) => {
            field.onChange(findRatio(value));
          }}
        />
      </div>
    </div>
  );
}
