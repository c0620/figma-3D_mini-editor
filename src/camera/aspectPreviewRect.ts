export function computeAspectRect(
  canvasWidth: number,
  canvasHeight: number,
  targetAspect: number
): { x: number; y: number; width: number; height: number } {
  let width = canvasWidth;
  let height = canvasHeight;

  if (width / height > targetAspect) {
    width = height * targetAspect;
  } else {
    height = width / targetAspect;
  }

  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
    width,
    height,
  };
}
