import { useEffect, useRef, useState } from "react";
import { computeAspectRect } from "@/camera/aspectPreviewRect";
import styles from "./AspectPreviewOutline.module.css";

export function AspectPreviewOutline({
  enabled,
  aspect,
}: {
  enabled: boolean;
  aspect: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ width, height });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const showOutline = enabled && size.width > 0 && size.height > 0;
  const rect = showOutline
    ? computeAspectRect(size.width, size.height, aspect)
    : null;

  return (
    <div ref={containerRef} className={styles.root}>
      {rect ? (
        <div
          className={styles.outline}
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
