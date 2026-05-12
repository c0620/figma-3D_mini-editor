import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { AppHandlers, AppKernel } from "./compositionRoot";

const AppKernelContext = createContext<AppKernel | null>(null);

export function AppKernelProvider({
  kernel,
  children,
}: {
  kernel: AppKernel;
  children: ReactNode;
}) {
  return (
    <AppKernelContext.Provider value={kernel}>
      {children}
    </AppKernelContext.Provider>
  );
}

function useKernel(): AppKernel {
  const kernel = useContext(AppKernelContext);
  if (!kernel)
    throw new Error("useKernel must be used inside AppKernelProvider");
  return kernel;
}

export function useHandlers(): AppHandlers {
  return useKernel().handlers;
}

export function useHistory() {
  const { undo, redo } = useKernel();
  return { undo, redo };
}

export function useTransfer() {
  return useKernel().transfer;
}

export function useI18n() {
  return useKernel().i18n;
}

export function useTooltips() {
  return useKernel().tooltips;
}

export function useHelp() {
  return useKernel().help;
}

export function useNotifications() {
  return useKernel().notifications;
}
