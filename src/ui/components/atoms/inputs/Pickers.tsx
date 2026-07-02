import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import styles from "./Pickers.module.scss";
import { Color, SRGBColorSpace } from "three";

export function InputColorPicker({
  value,
  onChange,
  onPalette,
}: {
  value: Color;
  onChange: (value: Color) => void;
  onPalette?: (value: Color) => void;
}) {
  const [cachedValue, setCachedValue] = useState(value.getHexString());
  const [cachedHEXValue, setCachedHEXValue] = useState(cachedValue);

  useEffect(() => {
    setCachedValue(value.getHexString());
    setCachedHEXValue(value.getHexString());
  }, [value.getHexString()]);

  const colorRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const listenerRef = useRef<((e: Event) => void) | null>(null);

  const setColorRef = (el: HTMLInputElement | null) => {
    if (colorRef.current && listenerRef.current) {
      colorRef.current.removeEventListener("change", listenerRef.current);
    }

    colorRef.current = el;

    if (!el) {
      listenerRef.current = null;
      return;
    }

    const handler = () => {
      onChangeRef.current(new Color(el.value));
    };

    listenerRef.current = handler;
    el.addEventListener("change", handler);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    switch (e.target.type) {
      case "number":
        var newValue = new Color("#" + cachedValue);
        const userValue = +e.target.value / 255;
        const rgb = { r: 0, g: 0, b: 0 };
        new Color("#" + cachedValue).getRGB(rgb, SRGBColorSpace);
        switch (e.target.id) {
          case "color-r":
            rgb.r = userValue;
            break;
          case "color-g":
            rgb.g = userValue;
            break;
          case "color-b":
            rgb.b = userValue;
            break;
        }
        newValue.setRGB(rgb.r, rgb.g, rgb.b, SRGBColorSpace);
        setCachedValue(newValue.getHexString());
        setCachedHEXValue(newValue.getHexString());
        onChange(newValue);
        break;
      case "color":
        var newValue = new Color(e.target.value);
        setCachedValue(newValue.getHexString());
        setCachedHEXValue(newValue.getHexString());
        onPalette?.(newValue);
        break;
      case "text":
        console.log(e.target.value);
        setCachedHEXValue(e.target.value);
        break;
    }
  };

  const onBlurHex = () => {
    const hex = Number.parseInt(cachedHEXValue, 16);
    if (cachedHEXValue.length == 6 && 0x000000 <= hex && hex <= 0xffffff) {
      console.log("pass");
      var newValue = new Color(hex);
      setCachedValue(newValue.getHexString());
      setCachedHEXValue(newValue.getHexString());
      onChange(newValue);
    } else {
      setCachedHEXValue(cachedValue);
    }
  };

  const hex = new Color("#" + cachedValue).getHex();
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;

  return (
    <>
      <div className={styles.inputColorContainer}>
        <div className={styles.inputColor}>
          <input
            ref={setColorRef}
            type="color"
            className={styles.colorPalette}
            value={"#" + cachedValue}
            onInput={handleChange}
          />
          <input
            type="text"
            className={styles.hexInput}
            onInput={handleChange}
            value={cachedHEXValue}
            onBlur={onBlurHex}
          />
          <div className={styles.rgbInputContainer}>
            <label className={styles.rgbInputLabel}>RGB:</label>
            <input
              id="color-r"
              type="number"
              className={styles.rgbInputField}
              onInput={handleChange}
              value={r.toString()}
            />
            <input
              id="color-g"
              type="number"
              className={styles.rgbInputField}
              onInput={handleChange}
              value={g.toString()}
            />
            <input
              id="color-b"
              type="number"
              className={styles.rgbInputField}
              onInput={handleChange}
              value={b.toString()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
