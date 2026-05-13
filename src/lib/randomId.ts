/**
 * UUID v4. В некоторых средах (в т.ч. iframe UI Figma) `crypto` недоступен или
 * реализован без `randomUUID` — используем Math.random.
 */
export function randomUUID(): string {
  const globalCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (
    typeof globalCrypto !== 'undefined' &&
    typeof globalCrypto.randomUUID === 'function'
  ) {
    return globalCrypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
