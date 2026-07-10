import type { FunctionComponent, SVGProps } from "react";

export type IconComponent = FunctionComponent<
  SVGProps<SVGSVGElement> & { title?: string }
>;
