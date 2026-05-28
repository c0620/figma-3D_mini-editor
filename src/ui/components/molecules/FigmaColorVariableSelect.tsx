import { useEffect, useRef, useState } from "react";

import { useFigma, useI18n } from "@/app/ApplicationKernelContext";
import type { FigmaColorVariableSummary } from "@/figma/figmaMessages";
import { isFigmaPlugin } from "@/figma/figmaApi";
import styles from "./FigmaColorVariableSelect.module.css";

export function FigmaColorVariableSelect({
  value,
  disabled = false,
  onSelect,
  onClear,
}: {
  value: string | null;
  disabled?: boolean;
  onSelect: (variableId: string, hex: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const figma = useFigma();
  const [open, setOpen] = useState(false);
  const [variables, setVariables] = useState<FigmaColorVariableSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const inFigma = isFigmaPlugin();
  const active = variables.find((v) => v.id === value);

  useEffect(() => {
    if (!inFigma || disabled) return;

    let cancelled = false;
    setLoading(true);
    void figma
      .listColorVariables()
      .then((list) => {
        if (!cancelled) setVariables(list);
      })
      .catch(() => {
        if (!cancelled) setVariables([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [figma, inFigma, disabled]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handlePick = async (variableId: string | null) => {
    if (variableId == null) {
      onClear();
      setOpen(false);
      return;
    }

    try {
      const hex = await figma.resolveColorVariable(variableId);
      onSelect(variableId, hex);
    } catch {
      return;
    }
    setOpen(false);
  };

  const triggerLabel = active
    ? `${active.name} · ${active.collectionName}`
    : t("material.figmaVariable.placeholder");

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled || !inFigma || loading}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={!inFigma ? t("material.figmaVariable.unavailable") : undefined}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.triggerLabel}>{triggerLabel}</span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open ? (
        <ul className={styles.menu} role="listbox">
          <li role="option" aria-selected={value == null}>
            <button
              type="button"
              className={styles.option}
              onClick={() => void handlePick(null)}
            >
              {t("material.figmaVariable.none")}
            </button>
          </li>
          {variables.map((variable) => {
            const selected = variable.id === value;
            return (
              <li key={variable.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={
                    selected
                      ? `${styles.option} ${styles.optionActive}`
                      : styles.option
                  }
                  onClick={() => void handlePick(variable.id)}
                >
                  <span className={styles.optionName}>{variable.name}</span>
                  <span className={styles.optionMeta}>
                    {variable.collectionName}
                  </span>
                </button>
              </li>
            );
          })}
          {variables.length === 0 ? (
            <li className={styles.empty}>{t("material.figmaVariable.empty")}</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
