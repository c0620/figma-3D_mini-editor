import { useCallback, useEffect, useRef, useState } from "react";
import type { TranslationKey } from "@/i18n/en";
import { useI18n } from "@/app/ApplicationKernelContext";
import { NavModalHeader } from "../atoms/Navigation";
import {
  HELP_NAV_GROUPS,
  helpSectionId,
  type HelpNavItem,
} from "../help/helpNav";
import { HELP_SECTIONS, HELP_SHORTCUTS } from "../help/helpContent";
import styles from "./HelpModal.module.css";

const TITLE_ID = "help-modal-title";

function scrollToSection(contentEl: HTMLElement, sectionId: string): void {
  const target = contentEl.querySelector<HTMLElement>(`#${CSS.escape(sectionId)}`);
  if (!target) return;

  const scrollMargin =
    parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top =
    contentEl.scrollTop +
    target.getBoundingClientRect().top -
    contentEl.getBoundingClientRect().top -
    scrollMargin;

  contentEl.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function unlockScrollAfterAnimation(
  contentEl: HTMLElement,
  onUnlock: () => void
): void {
  const release = () => {
    contentEl.removeEventListener("scrollend", release);
    onUnlock();
  };

  if ("onscrollend" in contentEl) {
    contentEl.addEventListener("scrollend", release, { once: true });
    return;
  }

  window.setTimeout(onUnlock, 500);
}

function HelpSidebar({
  activeId,
  onNavigate,
}: {
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  const { t } = useI18n();

  const renderLink = (item: HelpNavItem) => {
    const isActive = activeId === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          {t(item.labelKey)}
        </button>
      </li>
    );
  };

  return (
    <nav className={styles.sidebar} aria-label={t("help.title")}>
      {HELP_NAV_GROUPS.map((group) => (
        <div key={group.labelKey} className={styles.navGroup}>
          <p className={styles.navGroupTitle}>{t(group.labelKey)}</p>
          <ul className={styles.navList}>{group.items.map(renderLink)}</ul>
        </div>
      ))}
    </nav>
  );
}

function HelpFeatureList({
  items,
  t,
}: {
  items: { icon: string; textKey: TranslationKey }[];
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <ul className={styles.featureList}>
      {items.map((item) => (
        <li key={item.textKey} className={styles.featureRow}>
          <img className={styles.featureIcon} src={item.icon} alt="" />
          <p className={styles.featureText}>{t(item.textKey)}</p>
        </li>
      ))}
    </ul>
  );
}

export function HelpModal({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  const [activeId, setActiveId] = useState<string>("settings");

  const handleNavigate = useCallback((id: string) => {
    const content = contentRef.current;
    if (!content) return;

    setActiveId(id);
    scrollLockRef.current = true;
    scrollToSection(content, helpSectionId(id));
    unlockScrollAfterAnimation(content, () => {
      scrollLockRef.current = false;
    });
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const ids = HELP_SECTIONS.map((s) => helpSectionId(s.id));
    const sections = ids
      .map((sid) => content.querySelector<HTMLElement>(`#${sid}`))
      .filter((el): el is HTMLElement => el != null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const id = visible[0].target.id.replace(/^help-/, "");
        setActiveId(id);
      },
      { root: content, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
      >
        <NavModalHeader
          title={t("help.title")}
          titleId={TITLE_ID}
          onClose={handleClose}
        />
        <div className={styles.body}>
          <HelpSidebar activeId={activeId} onNavigate={handleNavigate} />
          <div ref={contentRef} className={styles.content}>
            {HELP_SECTIONS.map((section) => (
              <section
                key={section.id}
                id={helpSectionId(section.id)}
                className={styles.section}
              >
                {section.groupTitleKey ? (
                  <h2 className={styles.groupTitle}>
                    {t(section.groupTitleKey)}
                  </h2>
                ) : null}
                <h3 className={styles.sectionTitle}>{t(section.titleKey)}</h3>
                {section.bodyKey ? (
                  <p className={styles.bodyText}>{t(section.bodyKey)}</p>
                ) : null}
                {section.introKey ? (
                  <p className={styles.introText}>{t(section.introKey)}</p>
                ) : null}
                {section.features ? (
                  <HelpFeatureList items={section.features} t={t} />
                ) : null}
                {section.actions ? (
                  <HelpFeatureList items={section.actions} t={t} />
                ) : null}
                {section.id === "shortcuts" ? (
                  <ul className={styles.shortcutList}>
                    {HELP_SHORTCUTS.map((row) => (
                      <li key={row.shortcutKey} className={styles.shortcutRow}>
                        <div className={styles.shortcutCopy}>
                          <p className={styles.shortcutName}>{t(row.nameKey)}</p>
                          <p className={styles.shortcutDesc}>
                            {t(row.descKey)}
                          </p>
                        </div>
                        <span className={styles.shortcutKeys}>
                          {t(row.shortcutKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
